"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Tag, X, Check } from "lucide-react"
import { useCartStore, useUIStore } from "../../store"
import { viLocale } from "../../locales/vi"

export function PromoCodeInput() {
  const [code, setCode] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const { promoCode, applyPromoCode, removePromoCode } = useCartStore()
  const showToast = useUIStore((state) => state.showToast)

  const handleApplyCode = async () => {
    if (!code.trim()) return

    setIsApplying(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      applyPromoCode(code.trim().toUpperCase())
      setCode("")
      showToast("Áp dụng mã giảm giá thành công!", "success")
    } catch (error) {
      showToast("Mã giảm giá không hợp lệ", "error")
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemoveCode = () => {
    removePromoCode()
    showToast("Đã bỏ mã giảm giá", "info")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyCode()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Mã giảm giá</span>
      </div>

      {promoCode ? (
        // Applied Promo Code
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <Badge variant="secondary" className="text-green-700 bg-green-100">
              {promoCode}
            </Badge>
            <span className="text-sm text-green-700">Đã áp dụng</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCode}
            className="text-green-600 hover:text-green-700 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        // Promo Code Input
        <div className="flex gap-2">
          <Input
            placeholder="Nhập mã giảm giá"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isApplying}
          />
          <Button
            onClick={handleApplyCode}
            disabled={!code.trim() || isApplying}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isApplying ? "..." : viLocale.checkout.applyPromo}
          </Button>
        </div>
      )}

      {/* Available Promo Codes Hint */}
      {!promoCode && (
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">Mã giảm giá có sẵn:</p>
          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted"
              onClick={() => setCode("TRAMHAN10")}
            >
              TRAMHAN10 (10%)
            </Badge>
            <Badge
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted"
              onClick={() => setCode("FREESHIP")}
            >
              FREESHIP (30k)
            </Badge>
            <Badge
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted"
              onClick={() => setCode("NEWCUSTOMER")}
            >
              NEWCUSTOMER (15%)
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
