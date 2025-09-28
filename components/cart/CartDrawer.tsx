"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { ShoppingCart, Trash2, Gift, ArrowRight } from "lucide-react"
import { CartItem } from "./CartItem"
import { CartSummary } from "./CartSummary"
import { PromoCodeInput } from "./PromoCodeInput"
import { useCartStore, useUIStore } from "../../store"
import { viLocale } from "../../locales/vi"

interface CartDrawerProps {
  children?: React.ReactNode
}

export function CartDrawer({ children }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { items, itemCount, total, subtotal, clearCart } = useCartStore()
  const showToast = useUIStore((state) => state.showToast)

  const handleClearCart = () => {
    clearCart()
    showToast("Đã xóa tất cả sản phẩm khỏi giỏ hàng", "success")
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    setIsOpen(false)
    // Navigate to checkout page
    window.location.href = "/checkout"
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="relative bg-transparent">
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="space-y-2.5 pr-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">{viLocale.cart.title}</SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa tất cả
              </Button>
            )}
          </div>

          {itemCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{itemCount} sản phẩm</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Tổng: {viLocale.cart.total}</span>
            </div>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          // Empty Cart State
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{viLocale.cart.empty}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">{viLocale.cart.emptyMessage}</p>
            </div>
            <Button onClick={() => setIsOpen(false)} className="bg-amber-600 hover:bg-amber-700">
              {viLocale.cart.continueShopping}
            </Button>
          </div>
        ) : (
          // Cart with Items
          <div className="flex-1 flex flex-col">
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <CartItem key={`${item.product.id}-${item.selectedVariant?.id || "default"}`} item={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Promo Code Section */}
            <div className="py-4 border-t">
              <PromoCodeInput />
            </div>

            {/* Free Shipping Progress */}
            <div className="py-4">
              <FreeShippingProgress subtotal={subtotal} />
            </div>

            {/* Cart Summary */}
            <div className="py-4 border-t">
              <CartSummary />
            </div>

            {/* Checkout Button */}
            <div className="pt-4 border-t">
              <Button onClick={handleCheckout} className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
                {viLocale.cart.checkout}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Phí vận chuyển và thuế sẽ được tính khi thanh toán
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Free Shipping Progress Component
function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const freeShippingThreshold = 500000 // 500,000 VND
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100)
  const remaining = Math.max(freeShippingThreshold - subtotal, 0)

  if (subtotal >= freeShippingThreshold) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Gift className="w-4 h-4" />
          <span className="font-medium">{viLocale.cart.freeShipping}</span>
        </div>
        <div className="w-full bg-green-100 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Gift className="w-4 h-4" />
          <span>Miễn phí vận chuyển</span>
        </div>
        <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        Mua thêm{" "}
        <span className="font-medium text-amber-600">
          {viLocale.cart.freeShippingThreshold.replace("{amount}", remaining.toLocaleString("vi-VN") + "đ")}
        </span>{" "}
        để được miễn phí vận chuyển
      </p>
    </div>
  )
}
