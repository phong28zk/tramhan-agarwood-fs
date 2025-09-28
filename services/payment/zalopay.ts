import CryptoJS from "crypto-js"
import type { Order, PaymentResult } from "../../types"

export interface ZaloPayConfig {
  appId: string
  key1: string
  key2: string
  endpoint: string
  redirectUrl?: string
  callbackUrl?: string
}

export class ZaloPayService {
  private config: ZaloPayConfig

  constructor() {
    this.config = {
      appId: process.env.NEXT_PUBLIC_ZALOPAY_APP_ID || "2553",
      key1: process.env.NEXT_PUBLIC_ZALOPAY_KEY1 || "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
      key2: process.env.ZALOPAY_KEY2 || "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
      endpoint: process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create",
      // redirectUrl: `${window.location.origin}/checkout/zalopay-return`,
      // callbackUrl: `${window.location.origin}/api/payments/zalopay/callback`,
    }
  }

  async createPaymentUrl(order: Order): Promise<string> {
    const transId = `${Date.now()}`
    const embedData = JSON.stringify({
      redirecturl: this.config.redirectUrl,
      orderId: order.id,
    })

    const orderData = {
      app_id: this.config.appId,
      app_trans_id: `${new Date().toISOString().slice(0, 6).replace(/-/g, "")}_${transId}`,
      app_user: order.shippingInfo.fullName,
      app_time: Date.now(),
      item: JSON.stringify([
        {
          itemid: order.id,
          itemname: `Đơn hàng ${order.id}`,
          itemprice: order.total,
          itemquantity: 1,
        },
      ]),
      embed_data: embedData,
      amount: order.total,
      description: `Thanh toán đơn hàng ${order.id} - Trầm Hân Agarwood`,
      bank_code: "",
      callback_url: this.config.callbackUrl,
    }

    const data = [
      orderData.app_id,
      orderData.app_trans_id,
      orderData.app_user,
      orderData.amount,
      orderData.app_time,
      orderData.embed_data,
      orderData.item,
    ].join("|")

    const mac = CryptoJS.HmacSHA256(data, this.config.key1).toString()

    const requestBody = {
      ...orderData,
      mac,
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(requestBody as any).toString(),
      })

      const result = await response.json()

      if (result.return_code === 1) {
        return result.order_url
      } else {
        throw new Error(result.return_message || "Failed to create ZaloPay payment")
      }
    } catch (error) {
      throw new Error(`ZaloPay payment creation failed: ${error}`)
    }
  }

  async verifyCallback(data: any): Promise<boolean> {
    const { mac, ...callbackData } = data
    const dataStr = [
      callbackData.app_id,
      callbackData.app_trans_id,
      callbackData.pmcid,
      callbackData.bank_code,
      callbackData.amount,
      callbackData.discount_amount,
      callbackData.status,
    ].join("|")

    const expectedMac = CryptoJS.HmacSHA256(dataStr, this.config.key2).toString()
    return expectedMac === mac
  }

  async handlePaymentReturn(params: URLSearchParams): Promise<PaymentResult> {
    const status = params.get("status")
    const appTransId = params.get("apptransid")
    const amount = params.get("amount")

    if (status === "1") {
      return {
        success: true,
        transactionId: appTransId || "",
        paymentMethod: "zalopay",
      }
    }

    return {
      success: false,
      error: "Giao dịch không thành công",
      errorCode: status || "UNKNOWN_ERROR",
    }
  }
}

export const zalopayService = new ZaloPayService()
