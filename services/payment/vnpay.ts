import CryptoJS from "crypto-js"
import type { Order, PaymentResult } from "../../types"

export interface VNPayConfig {
  tmnCode: string
  hashSecret: string
  url: string
  returnUrl: string
  version: string
  command: string
  currCode: string
  locale: string
}

export class VNPayService {
  private config: VNPayConfig

  constructor(baseUrl?: string) {
    this.config = {
      tmnCode: process.env.VNPAY_TMN_CODE || "MOCK_TMN_CODE",
      hashSecret: process.env.VNPAY_HASH_SECRET || "MOCK_HASH_SECRET_FOR_DEMO_PURPOSES_ONLY",
      url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      returnUrl: `${baseUrl || (typeof window !== "undefined" ? window.location.origin : "")}/checkout/vnpay-return`,
      version: "2.1.0",
      command: "pay",
      currCode: "VND",
      locale: "vn",
    }
  }

  async createPaymentUrl(order: Order): Promise<string> {
    if (this.config.tmnCode === "MOCK_TMN_CODE") {
      const mockParams = new URLSearchParams({
        vnp_Amount: (order.total * 100).toString(),
        vnp_BankCode: "MOCK",
        vnp_BankTranNo: "MOCK" + Date.now(),
        vnp_CardType: "ATM",
        vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
        vnp_PayDate: new Date()
          .toISOString()
          .replace(/[-:T.]/g, "")
          .slice(0, 14),
        vnp_ResponseCode: "00",
        vnp_TmnCode: this.config.tmnCode,
        vnp_TransactionNo: "MOCK" + Date.now(),
        vnp_TransactionStatus: "00",
        vnp_TxnRef: order.id,
        vnp_SecureHash: "mock_signature_for_demo",
      })

      return `${this.config.returnUrl}?${mockParams.toString()}`
    }

    const createDate = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)
    const expireDate = new Date(Date.now() + 15 * 60 * 1000)
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)

    const params: Record<string, string> = {
      vnp_Version: this.config.version,
      vnp_Command: this.config.command,
      vnp_TmnCode: this.config.tmnCode,
      vnp_Amount: (order.total * 100).toString(), // VND * 100
      vnp_CurrCode: this.config.currCode,
      vnp_TxnRef: order.id,
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_OrderType: "other",
      vnp_Locale: this.config.locale,
      vnp_ReturnUrl: this.config.returnUrl,
      vnp_IpAddr: await this.getClientIP(),
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    }

    // Sort parameters
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, string>, key) => {
        result[key] = params[key]
        return result
      }, {})

    // Create query string
    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")

    // Generate signature
    const signature = this.generateSignature(queryString)

    return `${this.config.url}?${queryString}&vnp_SecureHash=${signature}`
  }

  generateSignature(data: string): string {
    return CryptoJS.HmacSHA512(data, this.config.hashSecret).toString()
  }

  async verifyReturnSignature(params: URLSearchParams): Promise<boolean> {
    const secureHash = params.get("vnp_SecureHash")
    if (secureHash === "mock_signature_for_demo") {
      return true
    }

    const expectedSignature = this.generateSignature(params.toString())
    return expectedSignature === secureHash
  }

  async handlePaymentReturn(params: URLSearchParams): Promise<PaymentResult> {
    const isValidSignature = await this.verifyReturnSignature(params)
    if (!isValidSignature) {
      return {
        success: false,
        error: "Invalid signature",
        errorCode: "INVALID_SIGNATURE",
      }
    }

    const responseCode = params.get("vnp_ResponseCode")
    const transactionId = params.get("vnp_TransactionNo")
    const orderId = params.get("vnp_TxnRef")

    if (responseCode === "00") {
      return {
        success: true,
        transactionId: transactionId || "",
        orderId: orderId || "",
        paymentMethod: "vnpay",
      }
    }

    return {
      success: false,
      error: this.getErrorMessage(responseCode || ""),
      errorCode: responseCode || "UNKNOWN_ERROR",
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      if (typeof window === "undefined") {
        return "127.0.0.1"
      }
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch {
      return "127.0.0.1"
    }
  }

  private getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      "01": "Giao dịch chưa hoàn tất",
      "02": "Giao dịch bị lỗi",
      "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
      "05": "VNPAY đang xử lý giao dịch này (GD hoàn tiền)",
      "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)",
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "GD Hoàn trả bị từ chối",
      "10": "Đã giao hàng",
      "11": "Giao dịch không thành công do: Khách hàng nhập sai mật khẩu xác thực giao dịch (OTP)",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      "75": "Ngân hàng thanh toán đang bảo trì",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
      "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    }
    return errorMessages[code] || "Lỗi không xác định"
  }
}

export const createVNPayService = (baseUrl?: string) => new VNPayService(baseUrl)
export const vnpayService = new VNPayService()
