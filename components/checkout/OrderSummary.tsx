"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Edit, Gift, Truck } from "lucide-react"
import { useCartStore } from "../../store"
import { formatVNDCurrency } from "../../utils"
import { viLocale } from "../../locales/vi"
import { PaymentQRCode } from "../payment/PaymentQRCode"

interface OrderSummaryProps {
  showEditButton?: boolean
  onEdit?: () => void
}

export function OrderSummary({ showEditButton = true, onEdit }: OrderSummaryProps) {
  const { items, subtotal, shipping, tax, discount, total, promoCode } = useCartStore()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{viLocale.checkout.orderSummary}</CardTitle>
          {showEditButton && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1" />
              Sửa
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">
            {viLocale.checkout.items} ({items.length})
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.selectedVariant?.id || "default"}`} className="flex gap-3">
                <img
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=48&width=48&text=SP"
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                  {item.selectedVariant && (
                    <p className="text-xs text-muted-foreground">Phân loại: {item.selectedVariant.name}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">SL: {item.quantity}</span>
                    <span className="text-sm font-medium">
                      {formatVNDCurrency((item.selectedVariant?.price || item.product.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{viLocale.cart.subtotal}</span>
            <span>{formatVNDCurrency(subtotal)}</span>
          </div>

          {/* Shipping */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{viLocale.cart.shipping}</span>
            </div>
            <span>
              {shipping === 0 ? (
                <Badge variant="secondary" className="text-xs">
                  <Gift className="w-3 h-3 mr-1" />
                  Miễn phí
                </Badge>
              ) : (
                formatVNDCurrency(shipping)
              )}
            </span>
          </div>

          {/* Tax */}
          {tax > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{viLocale.cart.tax} (10%)</span>
              <span>{formatVNDCurrency(tax)}</span>
            </div>
          )}

          {/* Discount */}
          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{viLocale.cart.discount}</span>
                {promoCode && (
                  <Badge variant="outline" className="text-xs">
                    {promoCode}
                  </Badge>
                )}
              </div>
              <span className="text-green-600">-{formatVNDCurrency(discount)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between font-semibold">
          <span>{viLocale.cart.total}</span>
          <span className="text-lg text-amber-600">{formatVNDCurrency(total)}</span>
        </div>

        {/* Savings */}
        {discount > 0 && (
          <div className="text-center">
            <Badge variant="secondary" className="text-xs text-green-600">
              Bạn đã tiết kiệm {formatVNDCurrency(discount)}
            </Badge>
          </div>
        )}

        {/* Free Shipping Progress */}
        {shipping > 0 && subtotal < 500000 && (
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700">
              Mua thêm <strong>{formatVNDCurrency(500000 - subtotal)}</strong> để được miễn phí vận chuyển
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
