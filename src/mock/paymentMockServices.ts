/**
 * Mock payment service implementations.
 * Designed to mirror real Chapa / Telebirr / Bank Transfer API shapes.
 * Swap these out for real HTTP calls when backend is ready.
 */

import type {
  PaymentRecord,
  PaymentProvider,
  PaymentStatus,
  ChapaInitRequest,
  ChapaInitResponse,
  ChapaVerifyResponse,
  TelebirrInitRequest,
  TelebirrInitResponse,
  TelebirrStatusResponse,
  BankAccount,
  BankTransferSubmitRequest,
  BankTransferSubmitResponse,
} from '../types/payment';

// In-memory payment store
let payments: PaymentRecord[] = [];

function delay(ms = 600): Promise<void> {
  return new Promise(res => setTimeout(res, ms));
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function txRef(): string {
  return `FC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export function mockGetPaymentByOrderId(orderId: string): PaymentRecord | null {
  return payments.find(p => p.order_id === orderId) ?? null;
}

export function mockGetAllPayments(): PaymentRecord[] {
  return [...payments];
}

function upsertPayment(record: PaymentRecord): PaymentRecord {
  const idx = payments.findIndex(p => p.id === record.id);
  if (idx === -1) {
    payments = [record, ...payments];
  } else {
    payments = payments.map(p => p.id === record.id ? record : p);
  }
  return record;
}

// ─── Chapa ────────────────────────────────────────────────────────────────────

export async function mockChapaInit(
  req: ChapaInitRequest,
): Promise<ChapaInitResponse> {
  await delay(800);

  const paymentId = `pay-chapa-${uuid().slice(0, 8)}`;
  const ref = req.tx_ref || txRef();

  upsertPayment({
    id: paymentId,
    order_id: req.order_id,
    provider: 'CHAPA',
    amount: req.amount,
    currency: req.currency,
    status: 'PENDING',
    reference: ref,
    checkout_url: `https://checkout.chapa.co/checkout/payment/${ref}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return {
    status: 'success',
    message: 'Hosted Link',
    data: {
      checkout_url: `https://checkout.chapa.co/checkout/payment/${ref}`,
    },
  };
}

export async function mockChapaVerify(
  txRef: string,
): Promise<ChapaVerifyResponse> {
  await delay(1200);

  const payment = payments.find(p => p.reference === txRef);
  if (!payment) {
    return {
      status: 'failed',
      message: 'Transaction not found',
      data: { tx_ref: txRef, status: 'failed', amount: 0, currency: 'ETB' },
    };
  }

  // Simulate 90% success rate
  const success = Math.random() > 0.1;
  const newStatus: PaymentStatus = success ? 'SUCCESS' : 'FAILED';

  upsertPayment({ ...payment, status: newStatus, updated_at: new Date().toISOString() });

  return {
    status: success ? 'success' : 'failed',
    message: success ? 'Payment verified' : 'Payment failed',
    data: {
      tx_ref: txRef,
      status: success ? 'success' : 'failed',
      amount: payment.amount,
      currency: payment.currency,
    },
  };
}

// ─── Telebirr ─────────────────────────────────────────────────────────────────

export async function mockTelebirrInit(
  req: TelebirrInitRequest,
): Promise<TelebirrInitResponse> {
  await delay(700);

  const paymentId = `pay-telebirr-${uuid().slice(0, 8)}`;
  const transactionId = `TLB-${Date.now()}`;

  upsertPayment({
    id: paymentId,
    order_id: req.order_id,
    provider: 'TELEBIRR',
    amount: req.amount,
    currency: 'ETB',
    status: 'PENDING',
    reference: transactionId,
    checkout_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

  return {
    status: 'success',
    message: 'USSD push sent',
    data: {
      transaction_id: transactionId,
      ussd_code: '*127*6*1#',
      expires_at: expiresAt,
    },
  };
}

export async function mockTelebirrPollStatus(
  transactionId: string,
): Promise<TelebirrStatusResponse> {
  await delay(1500);

  const payment = payments.find(p => p.reference === transactionId);
  if (!payment) {
    return { transaction_id: transactionId, status: 'FAILED', amount: 0 };
  }

  // Simulate: first poll → PENDING, second poll → SUCCESS (90%) or FAILED
  const success = Math.random() > 0.15;
  const newStatus: PaymentStatus = success ? 'SUCCESS' : 'FAILED';

  upsertPayment({ ...payment, status: newStatus, updated_at: new Date().toISOString() });

  return {
    transaction_id: transactionId,
    status: success ? 'SUCCESS' : 'FAILED',
    amount: payment.amount,
  };
}

// ─── Bank Transfer ────────────────────────────────────────────────────────────

export const FARMCONNECT_BANK_ACCOUNTS: BankAccount[] = [
  {
    bank_name: 'Commercial Bank of Ethiopia',
    account_name: 'FarmConnect PLC',
    account_number: '1000123456789',
    branch: 'Bole Branch, Addis Ababa',
  },
  {
    bank_name: 'Awash Bank',
    account_name: 'FarmConnect PLC',
    account_number: '01320123456789',
    branch: 'Kazanchis Branch, Addis Ababa',
  },
];

export async function mockBankTransferSubmit(
  req: BankTransferSubmitRequest,
): Promise<BankTransferSubmitResponse> {
  await delay(600);

  const paymentId = `pay-bank-${uuid().slice(0, 8)}`;

  upsertPayment({
    id: paymentId,
    order_id: req.order_id,
    provider: 'BANK_TRANSFER',
    amount: req.amount,
    currency: 'ETB',
    status: 'AWAITING_VERIFICATION',
    reference: req.transaction_reference,
    checkout_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return {
    payment_id: paymentId,
    status: 'AWAITING_VERIFICATION',
    message: 'Your transfer reference has been submitted. Admin will verify within 24 hours.',
  };
}

export async function mockAdminVerifyBankTransfer(
  paymentId: string,
  approve: boolean,
): Promise<PaymentRecord> {
  await delay(400);

  const idx = payments.findIndex(p => p.id === paymentId);
  if (idx === -1) {
    const err: any = new Error('Payment not found');
    err.response = { status: 404 };
    throw err;
  }

  const updated: PaymentRecord = {
    ...payments[idx],
    status: approve ? 'SUCCESS' : 'FAILED',
    updated_at: new Date().toISOString(),
  };
  payments = payments.map(p => p.id === paymentId ? updated : p);
  return { ...updated };
}
