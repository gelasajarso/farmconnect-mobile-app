// ─── Payment Types ────────────────────────────────────────────────────────────

export type PaymentProvider = 'CHAPA' | 'TELEBIRR' | 'BANK_TRANSFER';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'AWAITING_VERIFICATION'; // bank transfer waiting admin approval

export interface PaymentRecord {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;           // 'ETB'
  status: PaymentStatus;
  reference: string | null;   // tx ref from provider or manual entry
  checkout_url: string | null; // Chapa redirect URL
  created_at: string;
  updated_at: string;
}

// ─── Chapa ────────────────────────────────────────────────────────────────────

export interface ChapaInitRequest {
  order_id: string;
  amount: number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
}

export interface ChapaInitResponse {
  status: 'success' | 'failed';
  message: string;
  data: {
    checkout_url: string;
  };
}

export interface ChapaVerifyResponse {
  status: 'success' | 'failed';
  message: string;
  data: {
    tx_ref: string;
    status: 'success' | 'failed' | 'pending';
    amount: number;
    currency: string;
  };
}

// ─── Telebirr ─────────────────────────────────────────────────────────────────

export interface TelebirrInitRequest {
  order_id: string;
  amount: number;
  phone_number: string;
  subject: string;
}

export interface TelebirrInitResponse {
  status: 'success' | 'failed';
  message: string;
  data: {
    transaction_id: string;
    ussd_code: string;       // e.g. *127*6*1#
    expires_at: string;
  };
}

export interface TelebirrStatusResponse {
  transaction_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amount: number;
}

// ─── Bank Transfer ────────────────────────────────────────────────────────────

export interface BankAccount {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
}

export interface BankTransferSubmitRequest {
  order_id: string;
  amount: number;
  transaction_reference: string;
  bank_name: string;
}

export interface BankTransferSubmitResponse {
  payment_id: string;
  status: 'AWAITING_VERIFICATION';
  message: string;
}

// ─── Unified payment init params (passed via navigation) ─────────────────────

export interface PaymentInitParams {
  order_id: string;
  amount: number;
  currency: string;
  product_name: string;
  merchant_name: string;
  merchant_email: string;
}
