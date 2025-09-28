"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { CreditCard, Smartphone, Building2, Banknote, ArrowRight } from "lucide-react"
import type { Order, PaymentMethod } from "../../types"

interface PaymentMethodSelectorProps {
  order: Order
  onMethodSelect: (method: PaymentMethod) => void
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ order, onMethodSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const paymentMethods = [
    {
      id: "stripe",
      name: "Thẻ quốc tế",
      description: "Visa, Mastercard, American Express",
      icon: <CreditCard className="h-6 w-6" />,
      fee: "2.9% + 2,000 VND",
      processingTime: "Tức thì",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      id: "vnpay",
      name: "VNPay",
      description: "Ngân hàng nội địa, QR Code",
      icon: <Building2 className="h-6 w-6" />,
      fee: "Miễn phí",
      processingTime: "Tức thì",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
    },
    {
      id: "momo",
      name: "MoMo",
      description: "Ví điện tử MoMo",
      icon: <Smartphone className="h-6 w-6" />,
      fee: "Miễn phí",
      processingTime: "Tức thì",
      color: "bg-pink-50 border-pink-200",
      iconColor: "text-pink-600",
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      description: "Ví điện tử ZaloPay",
      icon: <Smartphone className="h-6 w-6" />,
      fee: "Miễn phí",
      processingTime: "Tức thì",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng",
      description: "Tiền mặt khi giao hàng",
      icon: <Banknote className="h-6 w-6" />,
      fee: "20,000 VND",
      processingTime: "Khi giao hàng",
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600",
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản trực tiếp",
      icon: <Building2 className="h-6 w-6" />,
      fee: "Miễn phí",
      processingTime: "1-2 giờ",
      color: "bg-gray-50 border-gray-200",
      iconColor: "text-gray-600",
    },
  ]

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    onMethodSelect({
      type: methodId as any,
      details: {},
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedMethod === method.id ? "ring-2 ring-amber-500 border-amber-300" : "hover:shadow-md"
            } ${method.color}`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-white ${method.iconColor}`}>{method.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-gray-500">Phí: {method.fee}</span>
                      <span className="text-xs text-gray-500">Xử lý: {method.processingTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMethod === method.id && (
                    <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMethod && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-900 mb-2">Phương thức đã chọn</h4>
          <p className="text-sm text-amber-800">
            {paymentMethods.find((m) => m.id === selectedMethod)?.name} - Tổng thanh toán:{" "}
            <span className="font-semibold">{order.total.toLocaleString("vi-VN")} VND</span>
          </p>
        </div>
      )}
    </div>
  )
}
