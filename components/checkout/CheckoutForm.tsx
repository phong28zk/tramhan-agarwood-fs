"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { ArrowLeft, Check } from "lucide-react"
import { ShippingForm } from "./ShippingForm"
import { PaymentForm } from "./PaymentForm"
import { OrderSummary } from "./OrderSummary"
import { OrderReview } from "./OrderReview"
import type { ShippingAddress, PaymentMethod, Order } from "../../types"
import { useCartStore, useUIStore } from "../../store"
import { viLocale } from "../../locales/vi"
import { OrderStatus } from "../../types" // Import OrderStatus from types file

type CheckoutStep = "shipping" | "payment" | "review"

interface CheckoutFormProps {
  onOrderComplete?: (orderId: string) => void
}

export function CheckoutForm({ onOrderComplete }: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  const { items, total, clearCart } = useCartStore()
  const showToast = useUIStore((state) => state.showToast)

  const steps = [
    { id: "shipping", title: viLocale.checkout.shipping, completed: !!shippingAddress },
    { id: "payment", title: viLocale.checkout.payment, completed: !!paymentMethod },
    { id: "review", title: viLocale.checkout.review, completed: false },
  ]

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const canProceedToPayment = !!shippingAddress
  const canProceedToReview = !!shippingAddress && !!paymentMethod
  const canPlaceOrder = !!shippingAddress && !!paymentMethod && items.length > 0

  const handleShippingSubmit = (address: ShippingAddress) => {
    // Debug logging for checkout step transition
    console.group('🛒 Checkout Step: Shipping Completed')
    console.log('Address Data:', address)
    console.log('Current Cart Total:', total)
    console.log('Current Step Before:', currentStep)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()

    console.log('🔄 Setting shipping address...')
    setShippingAddress(address)

    const order: Order = {
      id: `TH${Date.now().toString(36).toUpperCase()}`,
      items,
      shippingInfo: address,
      paymentMethod: {} as PaymentMethod,
      subtotal: total - total * 0.1 - 30000, // Assuming 10% tax and 30k shipping
      shipping: 30000,
      tax: total * 0.1,
      discount: 0,
      total,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log('📝 Created order:', order.id)
    setCurrentOrder(order)

    console.log('🚀 Transitioning to payment step...')
    console.log('Current Step Before setCurrentStep:', currentStep)

    setCurrentStep("payment")

    // Add a timeout to check if the step actually changed
    setTimeout(() => {
      console.log('✅ Step transition complete. Current step:', currentStep)
    }, 100)

    showToast("Đã lưu thông tin giao hàng", "success")
  }

  const handlePaymentSubmit = (payment: PaymentMethod) => {
    // Debug logging for payment step
    console.group('🛒 Checkout Step: Payment Selected')
    console.log('Payment Method:', payment)
    console.log('Order ID:', currentOrder?.id)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()

    setPaymentMethod(payment)
    if (currentOrder) {
      setCurrentOrder({
        ...currentOrder,
        paymentMethod: payment,
        updatedAt: new Date(),
      })
    }

    console.log('✅ Payment method saved, navigating to review step')
    setCurrentStep("review")
    showToast("Đã chọn phương thức thanh toán", "success")
  }

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return

    setIsProcessing(true)
    try {
      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const orderId = `TH${Date.now().toString(36).toUpperCase()}`

      // Clear cart and redirect
      clearCart()
      showToast("Đặt hàng thành công!", "success")
      onOrderComplete?.(orderId)

      // In a real app, this would redirect to order confirmation page
      window.location.href = `/orders/${orderId}`
    } catch (error) {
      showToast("Có lỗi xảy ra khi đặt hàng", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const goToStep = (step: CheckoutStep) => {
    if (step === "payment" && !canProceedToPayment) return
    if (step === "review" && !canProceedToReview) return
    setCurrentStep(step)
  }

  const goBack = () => {
    if (currentStep === "payment") setCurrentStep("shipping")
    if (currentStep === "review") setCurrentStep("payment")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-4">Bạn chưa có sản phẩm nào để thanh toán</p>
            <Button onClick={() => (window.location.href = "/products")}>Tiếp tục mua sắm</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{viLocale.checkout.title}</h1>

          {/* Progress Steps */}
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id as CheckoutStep)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    step.id === currentStep
                      ? "text-amber-600"
                      : step.completed
                        ? "text-green-600 hover:text-green-700"
                        : "text-muted-foreground"
                  }`}
                  disabled={
                    (step.id === "payment" && !canProceedToPayment) || (step.id === "review" && !canProceedToReview)
                  }
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.id === currentStep
                        ? "border-amber-600 bg-amber-50"
                        : step.completed
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300 bg-white"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <span
                        className={
                          step.id === currentStep
                            ? "text-amber-600"
                            : step.completed
                              ? "text-green-600"
                              : "text-muted-foreground"
                        }
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentStep === "shipping" && "📍"}
                  {currentStep === "payment" && "💳"}
                  {currentStep === "review" && "📋"}
                  {steps.find((s) => s.id === currentStep)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === "shipping" && (
                  <ShippingForm
                    initialData={shippingAddress}
                    onSubmit={handleShippingSubmit}
                    onCancel={() => (window.location.href = "/cart")}
                  />
                )}

                {currentStep === "payment" && currentOrder && (
                  <PaymentForm
                    shippingAddress={shippingAddress!}
                    order={currentOrder}
                    onSubmit={handlePaymentSubmit}
                    onBack={goBack}
                  />
                )}

                {currentStep === "review" && (
                  <OrderReview
                    shippingAddress={shippingAddress!}
                    paymentMethod={paymentMethod!}
                    onPlaceOrder={handlePlaceOrder}
                    onBack={goBack}
                    isProcessing={isProcessing}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummary
                showEditButton={currentStep !== "review"}
                onEdit={() => (window.location.href = "/cart")}
                showQRCode={currentStep === "payment" || currentStep === "review"}
                orderId={currentOrder?.id}
              />

              {/* Step Navigation */}
              {currentStep !== "shipping" && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <Button variant="outline" onClick={goBack} className="w-full bg-transparent">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
