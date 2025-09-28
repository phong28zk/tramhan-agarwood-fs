import { type NextRequest, NextResponse } from "next/server"
import { createVNPayService } from "../../../../services/payment/vnpay"
import { getOrderById } from "../../../../services/orderService"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const order = await getOrderById(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const vnpayService = createVNPayService(baseUrl)
    const paymentUrl = await vnpayService.createPaymentUrl(order)

    return NextResponse.json({ paymentUrl })
  } catch (error) {
    console.error("VNPay payment creation error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
