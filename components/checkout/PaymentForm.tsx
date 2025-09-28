"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Building, Truck, ArrowLeft } from "lucide-react"
import type { PaymentMethod, ShippingAddress, Order } from "../../types"
import { formatVNDCurrency } from "../../utils"
import { PaymentMethodSelector } from "../payment/PaymentMethodSelector"
import { StripePaymentForm } from "../payment/StripePaymentForm"
import { VNPaymentForm } from "../payment/VNPaymentForm"

interface PaymentFormProps {
  shippingAddress: ShippingAddress
  order: Order
  onSubmit: (paymentMethod: PaymentMethod) => void
  onBack: () => void
}

export function PaymentForm({ shippingAddress, order, onSubmit, onBack }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)

    // For Vietnamese payment methods and COD/Bank Transfer, proceed directly
    if (["vnpay", "momo", "zalopay", "cod", "bank_transfer"].includes(method.type)) {
      setShowPaymentForm(true)
    } else if (method.type === "stripe") {
      // For Stripe, show the payment form
      setShowPaymentForm(true)
    }
  }

  const handlePaymentComplete = (result: any) => {
    if (selectedMethod) {
      onSubmit({
        ...selectedMethod,
        details: {
          ...selectedMethod.details,
          ...result,
        },
      })
    }
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    // You could show a toast notification here
    setIsProcessing(false)
  }

  const handleDirectPaymentComplete = () => {
    if (selectedMethod) {
      onSubmit(selectedMethod)
    }
  }

  if (!showPaymentForm) {
    return (
      <div className="space-y-6">
        {/* Shipping Address Summary */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Giao hàng đến:</h3>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {shippingAddress.fullName} | {shippingAddress.phone}
              </p>
              <p>
                {shippingAddress.address}, {shippingAddress.ward}, {shippingAddress.district},{" "}
                {shippingAddress.province}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="font-medium">Chọn phương thức thanh toán</h3>
          <PaymentMethodSelector order={order} onMethodSelect={handleMethodSelect} />
        </div>

        {/* Security Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">🔒</span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Thanh toán an toàn</p>
                <p className="text-blue-700">
                  Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối. Chúng tôi không lưu trữ thông tin thẻ
                  của bạn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Shipping Address Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Giao hàng đến:</h3>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {shippingAddress.fullName} | {shippingAddress.phone}
            </p>
            <p>
              {shippingAddress.address}, {shippingAddress.ward}, {shippingAddress.district}, {shippingAddress.province}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowPaymentForm(false)} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-medium">Thanh toán</h3>
        </div>

        {selectedMethod?.type === "stripe" && (
          <StripePaymentForm
            order={order}
            onPaymentComplete={handlePaymentComplete}
            onPaymentError={handlePaymentError}
          />
        )}

        {["vnpay", "momo", "zalopay"].includes(selectedMethod?.type || "") && (
          <VNPaymentForm order={order} onPaymentComplete={handlePaymentComplete} onPaymentError={handlePaymentError} />
        )}

        {selectedMethod?.type === "cod" && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Truck className="h-12 w-12 text-orange-500 mx-auto" />
                <h3 className="text-lg font-semibold">Thanh toán khi nhận hàng</h3>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800 text-sm mb-2">Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng</p>
                  <p className="text-orange-700 text-xs">Phí thu hộ: {formatVNDCurrency(20000)}</p>
                </div>
                <Button onClick={handleDirectPaymentComplete} className="w-full" size="lg">
                  Xác nhận đặt hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMethod?.type === "bank_transfer" && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Building className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Chuyển khoản ngân hàng</h3>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Thông tin chuyển khoản:</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Ngân hàng:</strong> Vietcombank
                    </p>
                    <p>
                      <strong>Số tài khoản:</strong> 1234567890
                    </p>
                    <p>
                      <strong>Chủ tài khoản:</strong> TRAM HAN AGARWOOD
                    </p>
                    <p>
                      <strong>Số tiền:</strong> {formatVNDCurrency(order.total)}
                    </p>
                    <p>
                      <strong>Nội dung:</strong> TH{order.id} {shippingAddress.phone}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Vui lòng chuyển khoản đúng số tiền và nội dung. Đơn hàng sẽ được xử lý sau khi chúng tôi nhận được
                    thanh toán.
                  </p>
                </div>

                <Button onClick={handleDirectPaymentComplete} className="w-full" size="lg">
                  Tôi đã chuyển khoản
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    </div>
  )
}
