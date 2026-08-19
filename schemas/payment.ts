export interface PaymentItem {
  payment_id: number;
  transaction_id: string;
  account_name: string;
  account_no: string;
  province_id: number;
  bill_id: number;
  bill_amount: number;
  paid_amount: number;
  bill_month: string | null;
  currency: number;
  terminal_id: string;
  description: string;
  mcid: string;
  mcc: string;
  bank_transaction_id: number;
  bank_ticket: string;
  bank_fccref: string;
  customer_paid: string;
  customer_phone: string;
  status: string;
  created_at: string;
  paid_at: string;
  provider_code: string;
  user_id: number;
  expired_at: string;
  retry_count: number;
  next_retry_at: string | null;
}

export interface PaymentApiResponse {
  items: PaymentItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  totalAmount?: number;
}
