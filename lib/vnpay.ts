import crypto from 'crypto';
import qs from 'qs';

export interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  url: string;
  returnUrl: string;
}

export interface VNPayPaymentParams {
  amount: number;
  orderId: string;
  orderInfo: string;
  ipAddress: string;
  locale?: string;
  bankCode?: string;
}

/**
 * Sort object by keys alphabetically - matches vnpay_nodejs implementation
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const str: string[] = [];
  let key: string;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Generate VNPay payment URL - matches vnpay_nodejs implementation
 */
export function createVNPayPaymentUrl(
  config: VNPayConfig,
  params: VNPayPaymentParams
): string {
  // Set timezone to Vietnam
  process.env.TZ = 'Asia/Ho_Chi_Minh';

  const date = new Date();

  // Format date as YYYYMMDDHHmmss in Vietnam timezone
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const createDate = year + month + day + hours + minutes + seconds;

  let vnp_Params: Record<string, any> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: params.locale || 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: params.amount * 100,
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: params.ipAddress,
    vnp_CreateDate: createDate,
  };

  // Add bank code if provided
  if (params.bankCode && params.bankCode !== '') {
    vnp_Params.vnp_BankCode = params.bankCode;
  }

  // Sort parameters
  vnp_Params = sortObject(vnp_Params);

  // Create signature
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', config.hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnp_Params.vnp_SecureHash = signed;

  // Create payment URL
  const vnpUrl = config.url + '?' + qs.stringify(vnp_Params, { encode: false });

  return vnpUrl;
}

/**
 * Verify VNPay return signature
 */
export function verifyVNPayReturn(
  params: Record<string, any>,
  hashSecret: string
): boolean {
  const secureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sortedParams = sortObject(params);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
}

/**
 * Get VNPay response message
 */
export function getVNPayResponseMessage(responseCode: string): string {
  const messages: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
  };

  return messages[responseCode] || 'Lỗi không xác định';
}

/**
 * Create VNPay query request signature
 * Used for querying transaction status
 */
export function createVNPayQuerySignature(
  requestId: string,
  version: string,
  command: string,
  tmnCode: string,
  txnRef: string,
  transactionDate: string,
  createDate: string,
  ipAddr: string,
  orderInfo: string,
  hashSecret: string
): string {
  const data = [
    requestId,
    version,
    command,
    tmnCode,
    txnRef,
    transactionDate,
    createDate,
    ipAddr,
    orderInfo,
  ].join('|');

  const hmac = crypto.createHmac('sha512', hashSecret);
  return hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
}

/**
 * Create VNPay refund request signature
 * Used for processing refunds
 */
export function createVNPayRefundSignature(
  requestId: string,
  version: string,
  command: string,
  tmnCode: string,
  transactionType: string,
  txnRef: string,
  amount: number,
  transactionNo: string,
  transactionDate: string,
  createBy: string,
  createDate: string,
  ipAddr: string,
  orderInfo: string,
  hashSecret: string
): string {
  const data = [
    requestId,
    version,
    command,
    tmnCode,
    transactionType,
    txnRef,
    amount.toString(),
    transactionNo,
    transactionDate,
    createBy,
    createDate,
    ipAddr,
    orderInfo,
  ].join('|');

  const hmac = crypto.createHmac('sha512', hashSecret);
  return hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
}

/**
 * Get VNPay transaction status message
 */
export function getVNPayTransactionStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    '00': 'Giao dịch thanh toán được thực hiện thành công',
    '01': 'Giao dịch đã được ghi nhận và đang chờ được xử lý',
    '02': 'Giao dịch bị từ chối bởi ngân hàng phát hành thẻ',
    '04': 'Giao dịch bị từ chối do vi phạm quy định',
    '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
    '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
    '07': 'Giao dịch bị nghi ngờ là giao dịch gian lận',
    '09': 'Giao dịch hoàn trả bị từ chối',
  };

  return messages[status] || 'Trạng thái không xác định';
}
