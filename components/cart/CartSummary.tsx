"use client"

import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { Truck, Gift } from "lucide-react"
import { useCartStore } from "../../store"
import { formatVNDCurrency } from "../../utils"
import { viLocale } from "../../locales/vi"

export function CartSummary() {
  const { subtotal, shipping, tax, discount, total, promoCode } = useCartStore()

  return (
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

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between font-semibold">
        <span>{viLocale.cart.total}</span>
        <span className="text-lg text-amber-600">{formatVNDCurrency(total)}</span>
      </div>

      {/* Savings Summary */}
      {discount > 0 && (
        <div className="text-center">
          <Badge variant="secondary" className="text-xs text-green-600">
            Bạn đã tiết kiệm {formatVNDCurrency(discount)}
          </Badge>
        </div>
      )}
    </div>
  )
}
