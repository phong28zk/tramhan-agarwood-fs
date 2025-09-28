import { NextRequest, NextResponse } from "next/server"
import { zalopayService } from "../../../../services/payment/zalopay"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Verify the callback signature
    const isValid = await zalopayService.verifyCallback(data)
    
    if (!isValid) {
      return NextResponse.json(
        { return_code: 0, return_message: "Invalid signature" },
        { status: 400 }
      )
    }

    // Process the payment result
    const { app_trans_id, status } = data
    
    if (status === 1) {
      // Payment successful
      console.log(`ZaloPay payment successful for transaction ${app_trans_id}`)
      
      // Here you would typically update your order status in database
      // const orderId = extractOrderIdFromTransactionId(app_trans_id)
      // await updateOrderStatus(orderId, 'paid', app_trans_id)
      
      return NextResponse.json({
        return_code: 1,
        return_message: "success"
      })
    } else {
      // Payment failed or cancelled
      console.log(`ZaloPay payment failed for transaction ${app_trans_id}`)
      
      return NextResponse.json({
        return_code: 0,
        return_message: "Payment failed or cancelled"
      })
    }
  } catch (error) {
    console.error("ZaloPay callback error:", error)
    return NextResponse.json(
      { return_code: 0, return_message: "Internal server error" },
      { status: 500 }
    )
  }
}