import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js"
import type { Order, PaymentResult } from "../../types"

export class StripePaymentService {
  private stripe: Stripe | null = null
  private elements: StripeElements | null = null

  async initialize(): Promise<void> {
    if (!this.stripe) {
      this.stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    }
  }

  async createPaymentIntent(order: Order): Promise<{ clientSecret: string }> {
    const response = await fetch("/api/payments/stripe/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(order.total * 100), // Convert VND to cents
        currency: "vnd",
        orderId: order.id,
        metadata: {
          orderId: order.id,
          customerName: order.shippingInfo.fullName,
          customerPhone: order.shippingInfo.phone,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create payment intent")
    }

    return response.json()
  }

  async confirmPayment(clientSecret: string, paymentElement: any): Promise<PaymentResult> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized")
    }

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: paymentElement,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    })

    if (error) {
      return {
        success: false,
        error: error.message || "Payment failed",
        errorCode: error.code,
      }
    }

    if (paymentIntent?.status === "succeeded") {
      return {
        success: true,
        transactionId: paymentIntent.id,
        paymentMethod: "stripe",
      }
    }

    return {
      success: false,
      error: "Payment not completed",
    }
  }

  createElements(clientSecret: string) {
    if (!this.stripe) {
      throw new Error("Stripe not initialized")
    }

    this.elements = this.stripe.elements({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#F59E0B",
          colorBackground: "#ffffff",
          colorText: "#1f2937",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, sans-serif",
          spacingUnit: "4px",
          borderRadius: "8px",
        },
      },
    })

    return this.elements
  }
}

export const stripeService = new StripePaymentService()
