"use client"

import { CheckoutForm } from "../../components/checkout/CheckoutForm"

export default function CheckoutPage() {
  const handleOrderComplete = (orderId: string) => {
    // Handle successful order completion
    console.log("Order completed:", orderId)
  }

  return <CheckoutForm onOrderComplete={handleOrderComplete} />
}
