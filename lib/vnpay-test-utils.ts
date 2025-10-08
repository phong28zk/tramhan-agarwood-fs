/**
 * VNPay Test Utilities
 * Helper functions for testing VNPay integration
 */

import crypto from 'crypto';
import qs from 'qs';

/**
 * Generate a test VNPay return URL with valid signature
 * Useful for testing the return endpoint
 */
export function generateTestVNPayReturnUrl(
  baseUrl: string,
  params: {
    orderId: string;
    amount: number;
    responseCode: string;
    transactionNo?: string;
    bankCode?: string;
  },
  hashSecret: string
): string {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const payDate = year + month + day + hours + minutes + seconds;

  let vnp_Params: Record<string, any> = {
    vnp_Amount: (params.amount * 100).toString(),
    vnp_BankCode: params.bankCode || 'NCB',
    vnp_BankTranNo: 'TEST' + Date.now(),
    vnp_CardType: 'ATM',
    vnp_OrderInfo: `Test payment for order ${params.orderId}`,
    vnp_PayDate: payDate,
    vnp_ResponseCode: params.responseCode,
    vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'TEST',
    vnp_TransactionNo: params.transactionNo || Date.now().toString(),
    vnp_TransactionStatus: params.responseCode,
    vnp_TxnRef: params.orderId,
  };

  // Sort parameters
  vnp_Params = sortObject(vnp_Params);

  // Create signature
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnp_Params.vnp_SecureHash = signed;

  return baseUrl + '/api/vnpay/return?' + qs.stringify(vnp_Params, { encode: false });
}

/**
 * Generate a test VNPay IPN URL with valid signature
 * Useful for testing the IPN endpoint
 */
export function generateTestVNPayIPNUrl(
  baseUrl: string,
  params: {
    orderId: string;
    amount: number;
    responseCode: string;
    transactionNo?: string;
    bankCode?: string;
  },
  hashSecret: string
): string {
  // IPN uses same parameters as return URL
  return generateTestVNPayReturnUrl(baseUrl, params, hashSecret).replace(
    '/api/vnpay/return',
    '/api/vnpay/ipn'
  );
}

/**
 * Format date to VNPay format (YYYYMMDDHHmmss)
 */
export function formatVNPayDate(date: Date = new Date()): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return year + month + day + hours + minutes + seconds;
}

/**
 * Parse VNPay date format to JavaScript Date
 */
export function parseVNPayDate(vnpayDate: string): Date {
  // Format: YYYYMMDDHHmmss
  const year = parseInt(vnpayDate.substring(0, 4));
  const month = parseInt(vnpayDate.substring(4, 6)) - 1;
  const day = parseInt(vnpayDate.substring(6, 8));
  const hours = parseInt(vnpayDate.substring(8, 10));
  const minutes = parseInt(vnpayDate.substring(10, 12));
  const seconds = parseInt(vnpayDate.substring(12, 14));

  return new Date(year, month, day, hours, minutes, seconds);
}

/**
 * Generate a test order ID (format: DDHHmmss)
 */
export function generateTestOrderId(): string {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return day + hours + minutes + seconds;
}

/**
 * Validate VNPay signature
 */
export function validateVNPaySignature(
  params: Record<string, any>,
  receivedHash: string,
  hashSecret: string
): boolean {
  const sortedParams = sortObject(params);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', hashSecret);
  const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return receivedHash === calculatedHash;
}

/**
 * Sort object by keys (matches VNPay implementation)
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const str: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+');
  }

  return sorted;
}

/**
 * Mock VNPay API responses for testing
 */
export const mockVNPayResponses = {
  querySuccess: {
    vnp_ResponseId: Date.now().toString(),
    vnp_Command: 'querydr',
    vnp_ResponseCode: '00',
    vnp_Message: 'Success',
    vnp_TmnCode: 'TEST',
    vnp_TxnRef: '08143520',
    vnp_Amount: '10000000',
    vnp_OrderInfo: 'Test payment',
    vnp_BankCode: 'NCB',
    vnp_PayDate: formatVNPayDate(),
    vnp_TransactionNo: '14012345',
    vnp_TransactionType: '01',
    vnp_TransactionStatus: '00',
  },

  queryNotFound: {
    vnp_ResponseId: Date.now().toString(),
    vnp_Command: 'querydr',
    vnp_ResponseCode: '91',
    vnp_Message: 'Transaction not found',
    vnp_TmnCode: 'TEST',
    vnp_TxnRef: '08143520',
  },

  refundSuccess: {
    vnp_ResponseId: Date.now().toString(),
    vnp_Command: 'refund',
    vnp_ResponseCode: '00',
    vnp_Message: 'Success',
    vnp_TmnCode: 'TEST',
    vnp_TxnRef: '08143520',
    vnp_Amount: '10000000',
    vnp_OrderInfo: 'Refund for test payment',
    vnp_TransactionNo: '14012345',
    vnp_TransactionStatus: '05',
  },

  refundFailed: {
    vnp_ResponseId: Date.now().toString(),
    vnp_Command: 'refund',
    vnp_ResponseCode: '95',
    vnp_Message: 'Transaction already refunded',
    vnp_TmnCode: 'TEST',
    vnp_TxnRef: '08143520',
  },
};

/**
 * Test scenarios for different payment outcomes
 */
export const testScenarios = {
  successfulPayment: {
    amount: 100000,
    responseCode: '00',
    description: 'Successful payment',
  },

  cancelledByUser: {
    amount: 100000,
    responseCode: '24',
    description: 'Payment cancelled by user',
  },

  insufficientBalance: {
    amount: 100000,
    responseCode: '51',
    description: 'Insufficient balance',
  },

  cardLocked: {
    amount: 100000,
    responseCode: '12',
    description: 'Card is locked',
  },

  timeout: {
    amount: 100000,
    responseCode: '11',
    description: 'Payment timeout',
  },

  wrongOTP: {
    amount: 100000,
    responseCode: '13',
    description: 'Wrong OTP',
  },
};

/**
 * Logging helper for tests
 */
export function logTestResult(
  testName: string,
  success: boolean,
  details?: any
): void {
  console.group(`Test: ${testName}`);
  console.log('Status:', success ? 'PASS' : 'FAIL');
  if (details) {
    console.log('Details:', details);
  }
  console.groupEnd();
}
