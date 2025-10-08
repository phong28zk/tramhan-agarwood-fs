/**
 * VNPay TypeScript Type Definitions
 * Complete type definitions for VNPay payment gateway integration
 */

/**
 * VNPay configuration from environment variables
 */
export interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  url: string;
  returnUrl: string;
  apiUrl?: string;
}

/**
 * Payment creation request parameters
 */
export interface VNPayPaymentParams {
  amount: number;
  orderId: string;
  orderInfo: string;
  ipAddress: string;
  locale?: string;
  bankCode?: string;
}

/**
 * Payment return query parameters from VNPay
 */
export interface VNPayReturnParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType?: string;
}

/**
 * IPN notification parameters from VNPay
 */
export interface VNPayIPNParams extends VNPayReturnParams {
  // Same as return params - VNPay sends identical parameters
}

/**
 * Query transaction request
 */
export interface VNPayQueryRequest {
  orderId: string;
  transDate: string; // Format: YYYYMMDDHHmmss
}

/**
 * Query transaction response from VNPay API
 */
export interface VNPayQueryResponse {
  vnp_ResponseId: string;
  vnp_Command: string;
  vnp_ResponseCode: string;
  vnp_Message: string;
  vnp_TmnCode: string;
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_OrderInfo: string;
  vnp_BankCode?: string;
  vnp_PayDate?: string;
  vnp_TransactionNo?: string;
  vnp_TransactionType?: string;
  vnp_TransactionStatus?: string;
  vnp_PromotionCode?: string;
  vnp_PromotionAmount?: string;
}

/**
 * Refund request parameters
 */
export interface VNPayRefundRequest {
  orderId: string;
  transDate: string; // Format: YYYYMMDDHHmmss - original transaction date
  amount: number; // Refund amount in VND
  transType: '02' | '03'; // '02' = full refund, '03' = partial refund
  user: string; // User who initiated the refund
  transactionNo?: string; // VNPay transaction number (optional)
}

/**
 * Refund response from VNPay API
 */
export interface VNPayRefundResponse {
  vnp_ResponseId: string;
  vnp_Command: string;
  vnp_ResponseCode: string;
  vnp_Message: string;
  vnp_TmnCode: string;
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_OrderInfo: string;
  vnp_BankCode?: string;
  vnp_PayDate?: string;
  vnp_TransactionNo?: string;
  vnp_TransactionType?: string;
  vnp_TransactionStatus?: string;
}

/**
 * IPN response codes
 */
export type VNPayIPNResponseCode = '00' | '01' | '02' | '04' | '97' | '99';

/**
 * IPN response format
 */
export interface VNPayIPNResponse {
  RspCode: VNPayIPNResponseCode;
  Message: string;
}

/**
 * Payment response codes
 */
export type VNPayPaymentResponseCode =
  | '00' // Success
  | '07' // Suspicious transaction
  | '09' // Card not registered
  | '10' // Authentication failed
  | '11' // Timeout
  | '12' // Card locked
  | '13' // Wrong OTP
  | '24' // Customer cancelled
  | '51' // Insufficient balance
  | '65' // Limit exceeded
  | '75' // Bank maintenance
  | '79' // Wrong password
  | '99'; // Unknown error

/**
 * Transaction status codes
 */
export type VNPayTransactionStatus =
  | '00' // Success
  | '01' // Pending
  | '02' // Rejected by bank
  | '04' // Violates regulations
  | '05' // Processing refund
  | '06' // Refund sent to bank
  | '07' // Suspicious
  | '09'; // Refund rejected

/**
 * Transaction types for refund
 */
export type VNPayTransactionType =
  | '02' // Full refund
  | '03'; // Partial refund

/**
 * Payment database model (example - adjust based on your schema)
 */
export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  status: '0' | '1' | '2'; // 0 = pending, 1 = success, 2 = failed
  transactionNo?: string;
  bankCode?: string;
  payDate?: string;
  responseCode?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * VNPay command types
 */
export type VNPayCommand = 'pay' | 'querydr' | 'refund';

/**
 * VNPay locale options
 */
export type VNPayLocale = 'vn' | 'en';

/**
 * VNPay version
 */
export const VNPAY_VERSION = '2.1.0' as const;

/**
 * VNPay currency code
 */
export const VNPAY_CURR_CODE = 'VND' as const;

/**
 * VNPay order type
 */
export type VNPayOrderType =
  | 'billpayment' // Bill payment
  | 'fashion' // Fashion
  | 'other'; // Other

/**
 * Helper type for VNPay date format
 */
export type VNPayDateFormat = string; // YYYYMMDDHHmmss

/**
 * Error response from API endpoints
 */
export interface VNPayAPIError {
  error: string;
  message?: string;
  status?: number;
  statusText?: string;
}

/**
 * Success response from create-payment endpoint
 */
export interface CreatePaymentResponse {
  success: boolean;
  paymentUrl: string;
  orderId: string;
}

/**
 * Success response from query endpoint
 */
export interface QueryTransactionResponse {
  success: boolean;
  statusMessage: string;
  data: {
    responseCode: string;
    message: string;
    orderId: string;
    amount: number;
    orderInfo?: string;
    bankCode?: string;
    payDate?: string;
    transactionNo?: string;
    transactionType?: string;
    transactionStatus?: string;
    promotionCode?: string;
    promotionAmount?: string;
  };
}

/**
 * Success response from refund endpoint
 */
export interface RefundTransactionResponse {
  success: boolean;
  statusMessage: string;
  data: {
    responseCode: string;
    message: string;
    orderId: string;
    amount: number;
    orderInfo?: string;
    bankCode?: string;
    payDate?: string;
    transactionNo?: string;
    transactionType?: string;
    transactionStatus?: string;
  };
}
