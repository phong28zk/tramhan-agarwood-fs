"use client"

import Image from "next/image"
import { formatVNDCurrency } from "../../utils"

interface QRCodeGeneratorProps {
  amount: number
  orderId?: string
  paymentMethods?: string[]
}

export const PaymentQRCode: React.FC<QRCodeGeneratorProps> = ({
  amount,
  orderId,
  paymentMethods = ['momo', 'zalopay', 'vnpay']
}) => {
  if (amount <= 0) {
    return null
  }

  return (
    <div className="qr-payment-section bg-white p-4 rounded-lg border border-gray-200">
      <div className="text-center space-y-3">
        <h3 className="font-medium text-gray-900">Thanh toán bằng QR Code</h3>

        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-red-800 text-sm font-medium mb-2">
            🏪 PHAM DIEU LINH - 0971117310
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative">
            <Image
              src="/qr-code.png"
              alt="QR Code thanh toán VietQR"
              width={280}
              height={350}
              className="rounded-lg border border-gray-200 shadow-sm"
              priority
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-center text-sm text-gray-600">
            Quét mã QR để thanh toán {formatVNDCurrency(amount)}
          </p>

          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-amber-800 text-sm">
              💡 <strong>Hướng dẫn:</strong> Mở ứng dụng banking/VietQR → Quét mã QR → Nhập số tiền → Xác nhận thanh toán
            </p>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              VietQR
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Banking Apps
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              NAPAS 247
            </span>
          </div>

          {orderId && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Nội dung chuyển khoản:</strong> TH{orderId}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Vui lòng nhập đúng nội dung để đơn hàng được xử lý nhanh chóng)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}