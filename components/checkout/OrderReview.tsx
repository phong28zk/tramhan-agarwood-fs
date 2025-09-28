"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ArrowLeft, CreditCard, MapPin, Package, Shield } from "lucide-react"
import type { ShippingAddress, PaymentMethod } from "../../types"
import { formatVNDCurrency } from "../../utils"
import { useCartStore } from "../../store"
import { viLocale } from "../../locales/vi"

interface OrderReviewProps {
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  onPlaceOrder: () => void
  onBack: () => void
  isProcessing: boolean
}

export function OrderReview({ shippingAddress, paymentMethod, onPlaceOrder, onBack, isProcessing }: OrderReviewProps) {
  const { items, total } = useCartStore()

  const getPaymentMethodName = (method: PaymentMethod) => {
    const methodNames = {
      stripe: viLocale.checkout.paymentMethods.stripe,
      vnpay: viLocale.checkout.paymentMethods.vnpay,
      momo: viLocale.checkout.paymentMethods.momo,
      zalopay: viLocale.checkout.paymentMethods.zalopay,
      cod: viLocale.checkout.paymentMethods.cod,
      bank_transfer: viLocale.checkout.paymentMethods.bankTransfer,
    }
    return methodNames[method.type] || method.type
  }

  return (
    <div className="space-y-6">
      {/* Order Items Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Sản phẩm đặt hàng ({items.length} sản phẩm)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.selectedVariant?.id || "default"}`} className="flex gap-4">
                <img
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=64&width=64&text=SP"
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-2">{item.product.name}</h4>
                  {item.selectedVariant && (
                    <p className="text-sm text-muted-foreground">Phân loại: {item.selectedVariant.name}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">Số lượng: {item.quantity}</span>
                    <span className="font-medium">
                      {formatVNDCurrency((item.selectedVariant?.price || item.product.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Địa chỉ giao hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{shippingAddress.fullName}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">{shippingAddress.phone}</span>
            </div>
            {shippingAddress.email && <p className="text-sm text-muted-foreground">{shippingAddress.email}</p>}
            <p className="text-sm">
              {shippingAddress.address}, {shippingAddress.ward}, {shippingAddress.district}, {shippingAddress.province}
            </p>
            {shippingAddress.postalCode && (
              <p className="text-sm text-muted-foreground">Mã bưu điện: {shippingAddress.postalCode}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Phương thức thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="font-medium">{getPaymentMethodName(paymentMethod)}</span>
            {paymentMethod.type === "cod" && (
              <Badge variant="outline" className="text-xs">
                +{formatVNDCurrency(20000)}
              </Badge>
            )}
          </div>

          {/* Payment Method Specific Info */}
          {paymentMethod.type === "bank_transfer" && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">Thông tin chuyển khoản:</p>
              <div className="space-y-1">
                <p>
                  <strong>Ngân hàng:</strong> Vietcombank
                </p>
                <p>
                  <strong>Số tài khoản:</strong> 1234567890
                </p>
                <p>
                  <strong>Chủ tài khoản:</strong> TRAM HAN AGARWOOD
                </p>
              </div>
            </div>
          )}

          {paymentMethod.type === "cod" && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm">
              <p className="text-amber-800">
                <strong>Lưu ý:</strong> Vui lòng chuẩn bị đủ tiền mặt khi nhận hàng. Phí thu hộ: 20.000đ
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Total */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-xl font-bold">
            <span>Tổng thanh toán:</span>
            <span className="text-amber-600">{formatVNDCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-2">Cam kết của chúng tôi</p>
              <ul className="text-blue-800 space-y-1">
                <li>• Sản phẩm chính hãng, chất lượng đảm bảo</li>
                <li>• Giao hàng nhanh chóng, đúng hẹn</li>
                <li>• Hỗ trợ đổi trả trong 7 ngày</li>
                <li>• Bảo mật thông tin khách hàng tuyệt đối</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onBack} disabled={isProcessing} className="flex-1 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <Button
          onClick={onPlaceOrder}
          disabled={isProcessing}
          className="flex-1 bg-amber-600 hover:bg-amber-700"
          size="lg"
        >
          {isProcessing ? "Đang xử lý đơn hàng..." : `${viLocale.checkout.placeOrder} • ${formatVNDCurrency(total)}`}
        </Button>
      </div>

      {/* Legal Notice */}
      <p className="text-xs text-muted-foreground text-center">
        Bằng cách đặt hàng, bạn đồng ý với{" "}
        <a href="/terms" className="text-amber-600 hover:underline">
          Điều khoản sử dụng
        </a>{" "}
        và{" "}
        <a href="/privacy" className="text-amber-600 hover:underline">
          Chính sách bảo mật
        </a>{" "}
        của chúng tôi.
      </p>
    </div>
  )
}
