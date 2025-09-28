"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "../../types"
import { formatVNDCurrency, getFengShuiElementColor } from "../../utils"
import { useCartStore, useUIStore } from "../../store"
import { viLocale } from "../../locales/vi"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { updateQuantity, removeItem } = useCartStore()
  const showToast = useUIStore((state) => state.showToast)

  const { product, quantity, selectedVariant } = item
  const currentPrice = selectedVariant?.price || product.price
  const maxStock = selectedVariant?.stockQuantity || product.stockQuantity
  const itemTotal = currentPrice * quantity

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return

    setIsUpdating(true)
    try {
      updateQuantity(product.id, newQuantity, selectedVariant?.id)
      showToast("Đã cập nhật số lượng", "success", 2000)
    } catch (error) {
      showToast("Có lỗi xảy ra khi cập nhật", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = () => {
    removeItem(product.id, selectedVariant?.id)
    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success")
  }

  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-16 h-16 object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=64&width=64&text=SP"
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Feng Shui Element Badge */}
            {product.fengShuiProperties && (
              <Badge
                variant="outline"
                className={`mb-1 text-xs ${getFengShuiElementColor(product.fengShuiProperties.element)}`}
              >
                {viLocale.elements[product.fengShuiProperties.element]}
              </Badge>
            )}

            {/* Product Name */}
            <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h4>

            {/* Variant Info */}
            {selectedVariant && <p className="text-xs text-muted-foreground mb-1">Phân loại: {selectedVariant.name}</p>}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-600">{formatVNDCurrency(currentPrice)}</span>
              {selectedVariant && selectedVariant.price !== product.price && (
                <span className="text-xs text-muted-foreground line-through">{formatVNDCurrency(product.price)}</span>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive p-1 h-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Quantity Controls and Total */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Controls */}
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>

            <span className="px-3 py-1 text-sm min-w-[40px] text-center">{isUpdating ? "..." : quantity}</span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxStock || isUpdating}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="font-semibold">{formatVNDCurrency(itemTotal)}</p>
            {quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatVNDCurrency(currentPrice)} x {quantity}
              </p>
            )}
          </div>
        </div>

        {/* Stock Warning */}
        {quantity >= maxStock && (
          <p className="text-xs text-orange-600 mt-1">Đã đạt số lượng tối đa ({maxStock} sản phẩm)</p>
        )}
      </div>
    </div>
  )
}
