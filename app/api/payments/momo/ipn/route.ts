import { NextRequest, NextResponse } from "next/server"
import { momoService } from "../../../../services/payment/momo"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Verify the IPN signature
    const isValid = await momoService.verifyIPN(data)
    
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      )
    }

    // Process the payment result
    const { resultCode, orderId, transId, message } = data
    
    if (resultCode === 0) {
      // Payment successful
      console.log(`MoMo payment successful for order ${orderId}, transaction ${transId}`)
      
      // Here you would typically update your order status in database
      // await updateOrderStatus(orderId, 'paid', transId)
      
      return NextResponse.json({ message: "OK" })
    } else {
      // Payment failed
      console.log(`MoMo payment failed for order ${orderId}: ${message}`)
      
      // Update order status to failed
      // await updateOrderStatus(orderId, 'failed', null, message)
      
      return NextResponse.json({ message: "Payment failed" })
    }
  } catch (error) {
    console.error("MoMo IPN error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}