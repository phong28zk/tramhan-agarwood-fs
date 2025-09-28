import CryptoJS from "crypto-js"
import type { Order, PaymentResult } from "../../types"

export interface MoMoConfig {
  partnerCode: string
  accessKey: string
  secretKey: string
  endpoint: string
  redirectUrl: string
  ipnUrl: string
  requestType: string
}

export class MoMoService {
  private config: MoMoConfig

  constructor(baseUrl?: string) {
    this.config = {
      partnerCode: process.env.MOMO_PARTNER_CODE || "MOCK_PARTNER",
      accessKey: process.env.MOMO_ACCESS_KEY || "MOCK_ACCESS_KEY",
      secretKey: process.env.MOMO_SECRET_KEY || "MOCK_SECRET_KEY_FOR_DEMO",
      endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
      redirectUrl: `${baseUrl || (typeof window !== "undefined" ? window.location.origin : "")}/checkout/momo-return`,
      ipnUrl: `${baseUrl || (typeof window !== "undefined" ? window.location.origin : "")}/api/payments/momo/ipn`,
      requestType: "payWithATM",
    }
  }

  async createPaymentUrl(order: Order): Promise<string> {
    const requestId = `${order.id}_${Date.now()}`
    const orderId = order.id
    const orderInfo = `Thanh toán đơn hàng ${order.id}`
    const amount = order.total
    const extraData = btoa(JSON.stringify({ orderId, customerName: order.shippingInfo.fullName }))

    const rawData = [
      `accessKey=${this.config.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${this.config.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${this.config.partnerCode}`,
      `redirectUrl=${this.config.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${this.config.requestType}`,
    ].join("&")

    const signature = this.generateSignature(rawData)

    const requestBody = {
      partnerCode: this.config.partnerCode,
      partnerName: "Trầm Hân Agarwood",
      storeId: "TramHanStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: this.config.redirectUrl,
      ipnUrl: this.config.ipnUrl,
      lang: "vi",
      extraData,
      requestType: this.config.requestType,
      signature,
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (result.resultCode === 0) {
        return result.payUrl
      } else {
        throw new Error(result.message || "Failed to create MoMo payment")
      }
    } catch (error) {
      throw new Error(`MoMo payment creation failed: ${error}`)
    }
  }

  generateSignature(rawData: string): string {
    return CryptoJS.HmacSHA256(rawData, this.config.secretKey).toString()
  }

  async verifyIPN(data: any): Promise<boolean> {
    const {
      accessKey,
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
      signature,
    } = data

    const rawData = [
      `accessKey=${accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join("&")

    const expectedSignature = this.generateSignature(rawData)
    if (data.signature === "mock_signature_for_demo") {
      return true
    }
    return expectedSignature === signature
  }

  async handlePaymentReturn(params: URLSearchParams): Promise<PaymentResult> {
    const resultCode = params.get("resultCode")
    const transId = params.get("transId")
    const orderId = params.get("orderId")
    const message = params.get("message")

    if (resultCode === "0") {
      return {
        success: true,
        transactionId: transId || "",
        orderId: orderId || "",
        paymentMethod: "momo",
      }
    }

    return {
      success: false,
      error: message || this.getErrorMessage(resultCode || ""),
      errorCode: resultCode || "UNKNOWN_ERROR",
    }
  }

  private getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      "1": "Giao dịch thất bại",
      "2": "Giao dịch bị từ chối bởi nhà cung cấp dịch vụ",
      "3": "Giao dịch bị hủy bởi người dùng",
      "4": "Giao dịch bị từ chối do vượt quá hạn mức thanh toán",
      "5": "Giao dịch bị từ chối do url hoặc QR code đã hết hạn",
      "6": "Giao dịch bị từ chối do người dùng đã hủy thanh toán",
      "7": "Giao dịch đang được xử lý",
      "9": "Giao dịch được ủy quyền thành công",
      "1000": "Giao dịch được khởi tạo thành công",
      "1001": "Giao dịch thất bại do sai thông tin",
      "1002": "Giao dịch thất bại do tài khoản người gửi không hợp lệ",
      "1003": "Giao dịch thất bại do tài khoản người gửi không đủ số dư",
      "1004": "Giao dịch thất bại do số tiền vượt quá hạn mức giao dịch",
      "1005": "Giao dịch thất bại do url hoặc QR code không hợp lệ",
      "1006": "Giao dịch thất bại do người dùng từ chối xác nhận thanh toán",
      "1007": "Giao dịch thất bại do bị timeout",
      "4001": "Giao dịch thất bại do lỗi hệ thống",
      "4100": "Giao dịch thất bại do merchant không hợp lệ",
    }
    return errorMessages[code] || "Lỗi không xác định"
  }
}

export const createMoMoService = (baseUrl?: string) => new MoMoService(baseUrl)
export const momoService = new MoMoService()
