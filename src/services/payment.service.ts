/**
 * Unified payment service.
 * All methods use mock implementations now.
 * To connect real APIs: replace mock* calls with api.post/get calls.
 */

import {
  mockChapaInit,
  mockChapaVerify,
  mockTelebirrInit,
  mockTelebirrPollStatus,
  mockBankTransferSubmit,
  mockAdminVerifyBankTransfer,
  mockGetPaymentByOrderId,
  mockGetAllPayments,
  FARMCONNECT_BANK_ACCOUNTS,
} from '../mock/paymentMockServices';

import type {
  ChapaInitRequest,
  ChapaInitResponse,
  ChapaVerifyResponse,
  TelebirrInitRequest,
  TelebirrInitResponse,
  TelebirrStatusResponse,
  BankAccount,
  BankTransferSubmitRequest,
  BankTransferSubmitResponse,
  PaymentRecord,
} from '../types/payment';

// ─── Chapa ────────────────────────────────────────────────────────────────────

export async function initChapaPayment(
  req: ChapaInitRequest,
): Promise<ChapaInitResponse> {
  // Real: return api.post('/payments/chapa/initialize', req)
  return mockChapaInit(req);
}

export async function verifyChapaPayment(
  txRef: string,
): Promise<ChapaVerifyResponse> {
  // Real: return api.get(`/payments/chapa/verify/${txRef}`)
  return mockChapaVerify(txRef);
}

// ─── Telebirr ─────────────────────────────────────────────────────────────────

export async function initTelebirrPayment(
  req: TelebirrInitRequest,
): Promise<TelebirrInitResponse> {
  // Real: return api.post('/payments/telebirr/initialize', req)
  return mockTelebirrInit(req);
}

export async function pollTelebirrStatus(
  transactionId: string,
): Promise<TelebirrStatusResponse> {
  // Real: return api.get(`/payments/telebirr/status/${transactionId}`)
  return mockTelebirrPollStatus(transactionId);
}

// ─── Bank Transfer ────────────────────────────────────────────────────────────

export function getBankAccounts(): BankAccount[] {
  return FARMCONNECT_BANK_ACCOUNTS;
}

export async function submitBankTransfer(
  req: BankTransferSubmitRequest,
): Promise<BankTransferSubmitResponse> {
  // Real: return api.post('/payments/bank-transfer/submit', req)
  return mockBankTransferSubmit(req);
}

export async function adminVerifyBankTransfer(
  paymentId: string,
  approve: boolean,
): Promise<PaymentRecord> {
  // Real: return api.post(`/payments/bank-transfer/${paymentId}/verify`, { approve })
  return mockAdminVerifyBankTransfer(paymentId, approve);
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export function getPaymentByOrderId(orderId: string): PaymentRecord | null {
  return mockGetPaymentByOrderId(orderId);
}

export function getAllPayments(): PaymentRecord[] {
  return mockGetAllPayments();
}
