"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { Loader2, QrCode, CreditCard, Building2 } from "lucide-react"
import type { Order, PaymentResult } from "../../types"

interface VNPaymentFormProps {
  order: Order
  onPaymentComplete: (result: PaymentResult) => void
  onPaymentError: (error: string) => void
}

export const VNPaymentForm: React.FC<VNPaymentFormProps> = ({ order, onPaymentComplete, onPaymentError }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "momo" | "zalopay" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async (method: "vnpay" | "momo" | "zalopay") => {
    setIsLoading(true)
    setError(null)
    setSelectedMethod(method)

    try {
      // Call the API to create payment URL
      const response = await fetch("/api/payment/vnpay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: order.total,
          orderId: order.id,
          orderInfo: `Thanh toán đơn hàng ${order.id} - ${order.items.length} sản phẩm`,
          locale: "vn",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment URL")
      }

      const data = await response.json()

      if (!data.success || !data.paymentUrl) {
        throw new Error("Invalid payment URL response")
      }

      // Log payment initiation
      console.log("🚀 Redirecting to VNPay:", {
        orderId: order.id,
        amount: order.total,
        paymentUrl: data.paymentUrl,
      })

      // Redirect to VNPay payment gateway
      window.location.href = data.paymentUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo thanh toán"
      setError(errorMessage)
      onPaymentError(errorMessage)
      setIsLoading(false)
      setSelectedMethod(null)
    }
  }

  const paymentMethods = [
    {
      id: "vnpay" as const,
      name: "VNPay",
      description: "Thanh toán qua ngân hàng nội địa",
      icon: <Building2 className="h-6 w-6" />,
      features: ["Hỗ trợ tất cả ngân hàng Việt Nam", "Thanh toán qua QR Code", "Bảo mật cao"],
      logo: "/vnpay-logo.png",
    },
    {
      id: "momo" as const,
      name: "MoMo",
      description: "Ví điện tử MoMo",
      icon: <QrCode className="h-6 w-6" />,
      features: ["Thanh toán nhanh chóng", "Quét mã QR", "Ưu đãi độc quyền"],
      logo: "/momo-logo.png",
    },
    {
      id: "zalopay" as const,
      name: "ZaloPay",
      description: "Ví điện tử ZaloPay",
      icon: <CreditCard className="h-6 w-6" />,
      features: ["Liên kết với Zalo", "Thanh toán an toàn", "Hoàn tiền nhanh"],
      logo: "/zalopay-logo.png",
    },
  ]

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <Card key={method.id} className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <img src={method.logo || "/placeholder.svg"} alt={method.name} className="h-8" />
              <div>
                <h3 className="text-lg font-semibold">{method.name}</h3>
                <p className="text-sm text-gray-600 font-normal">{method.description}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Ưu điểm</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  {method.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handlePayment(method.id)}
                disabled={isLoading}
                className="w-full"
                size="lg"
                variant={selectedMethod === method.id ? "default" : "outline"}
              >
                {isLoading && selectedMethod === method.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang chuyển hướng...
                  </>
                ) : (
                  <>
                    {method.icon}
                    <span className="ml-2">
                      Thanh toán {order.total.toLocaleString("vi-VN")} VND qua {method.name}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-amber-50 p-4 rounded-lg">
        <h4 className="font-medium text-amber-900 mb-2">Lưu ý quan trọng</h4>
        <div className="text-sm text-amber-800 space-y-1">
          <p>• Vui lòng không đóng trình duyệt trong quá trình thanh toán</p>
          <p>• Giao dịch sẽ tự động hủy sau 15 phút nếu không hoàn tất</p>
          <p>• Liên hệ hotline 1900-xxxx nếu cần hỗ trợ</p>
        </div>
      </div>
    </div>
  )
}
