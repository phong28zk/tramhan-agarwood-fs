"use client"

import { useMemo } from "react"
import { QRCodeSVG } from "qrcode.react"
import { formatVNDCurrency } from "../../utils"

interface QRCodeGeneratorProps {
  amount: number
  orderId?: string
  paymentMethods?: string[]
}

interface PaymentQRData {
  amount: number
  currency: 'VND'
  orderId: string
  description: string
  methods: string[]
  timestamp: string
}

export const PaymentQRCode: React.FC<QRCodeGeneratorProps> = ({
  amount,
  orderId,
  paymentMethods = ['momo', 'zalopay', 'vnpay']
}) => {
  const qrData = useMemo(() => {
    const data: PaymentQRData = {
      amount: amount,
      currency: 'VND',
      orderId: orderId || `TH${Date.now()}`,
      description: `Thanh toán đơn hàng Trầm Hân`,
      methods: paymentMethods,
      timestamp: new Date().toISOString()
    }
    return data
  }, [amount, orderId, paymentMethods])

  if (amount <= 0) {
    return null
  }

  return (
    <div className="qr-payment-section bg-white p-4 rounded-lg border border-gray-200">
      <div className="text-center space-y-3">
        <h3 className="font-medium text-gray-900">Thanh toán bằng QR Code</h3>

        <div className="flex justify-center">
          <QRCodeSVG
            value={JSON.stringify(qrData)}
            size={200}
            level="M"
            includeMargin={true}
            className="border border-gray-100 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <p className="text-center text-sm text-gray-600">
            Quét mã QR để thanh toán {formatVNDCurrency(amount)}
          </p>

          <div className="flex justify-center gap-2 flex-wrap">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {method.toUpperCase()}
              </span>
            ))}
          </div>

          {orderId && (
            <p className="text-xs text-gray-500">
              Mã đơn hàng: {orderId}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}