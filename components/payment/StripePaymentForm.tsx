"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { Loader2 } from "lucide-react"
import type { Order, PaymentResult } from "../../types"
import { stripeService } from "../../services/payment/stripe"

interface StripePaymentFormProps {
  order: Order
  onPaymentComplete: (result: PaymentResult) => void
  onPaymentError: (error: string) => void
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ order, onPaymentComplete, onPaymentError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const initializePayment = async () => {
      try {
        await stripeService.initialize()
        const { clientSecret } = await stripeService.createPaymentIntent(order)
        setClientSecret(clientSecret)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize payment"
        setError(errorMessage)
        onPaymentError(errorMessage)
      }
    }

    initializePayment()
  }, [order, onPaymentError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await stripeService.confirmPayment(clientSecret, elements)

      if (result.success) {
        onPaymentComplete(result)
      } else {
        setError(result.error || "Payment failed")
        onPaymentError(result.error || "Payment failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!clientSecret && !error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Đang khởi tạo thanh toán...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="/stripe-logo.png" alt="Stripe" className="h-6" />
          Thanh toán bằng thẻ quốc tế
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {clientSecret && (
            <div className="p-4 border rounded-lg">
              <PaymentElement
                options={{
                  layout: "tabs",
                  paymentMethodOrder: ["card"],
                }}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Thông tin thanh toán</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Hỗ trợ thẻ Visa, Mastercard, American Express</p>
              <p>• Giao dịch được bảo mật với công nghệ 3D Secure</p>
              <p>• Phí giao dịch: 2.9% + 2,000 VND</p>
            </div>
          </div>

          <Button type="submit" disabled={!stripe || !clientSecret || isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `Thanh toán ${order.total.toLocaleString("vi-VN")} VND`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
