"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import type { Product } from "../../types"
import { formatVNDCurrency, getFengShuiElementColor } from "../../utils"
import { useCartStore } from "../../store"
import { viLocale } from "../../locales/vi"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
  onViewDetails?: (product: Product) => void
}

export function ProductCard({ product, variant = "default", onViewDetails }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const router = useRouter()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product, 1)
    // Would show toast notification in real app
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    // Would save to wishlist in real app
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product)
    } else {
      // Navigate to product detail page using Next.js router
      router.push(`/products/${product.id}`)
    }
  }

  const cardClasses = {
    default: "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
    compact: "h-full transition-all duration-200 hover:shadow-md",
    featured: "h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-amber-200",
  }

  const imageClasses = {
    default: "h-48",
    compact: "h-32",
    featured: "h-64",
  }

  return (
    <Card
      className={cardClasses[variant]}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden rounded-t-lg ${imageClasses[variant]}`}>
        <img
          src={product.images[currentImageIndex] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=Sản phẩm"
          }}
        />

        {/* Image Navigation Dots */}
        {product.images.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {product.images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
              />
            ))}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-medium">
              {viLocale.product.outOfStock}
            </Badge>
          </div>
        )}

        {/* Quick Actions (on hover) */}
        {isHovered && product.inStock && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetails()
              }}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="w-4 h-4 mr-1" />
              {viLocale.product.viewDetails}
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex-1">
        {/* Feng Shui Element Badge */}
        {product.fengShuiProperties && (
          <Badge
            variant="outline"
            className={`mb-2 text-xs ${getFengShuiElementColor(product.fengShuiProperties.element)}`}
          >
            {viLocale.elements[product.fengShuiProperties.element]}
          </Badge>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-2 text-balance">{product.name}</h3>

        {/* Product Description */}
        {variant !== "compact" && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
        )}

        {/* Feng Shui Benefits (Featured variant only) */}
        {variant === "featured" && product.fengShuiProperties && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">{viLocale.product.benefits}:</p>
            <div className="flex flex-wrap gap-1">
              {product.fengShuiProperties.benefits.slice(0, 2).map((benefit, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-amber-600">{formatVNDCurrency(product.price)}</p>
            {product.variants && product.variants.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Từ {formatVNDCurrency(Math.min(...product.variants.map((v) => v.price)))}
              </p>
            )}
          </div>

          {/* Stock Indicator */}
          {product.inStock && (
            <div className="text-right">
              {product.stockQuantity <= 5 ? (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                  {viLocale.product.lowStock}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  {viLocale.product.inStock}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          size={variant === "compact" ? "sm" : "default"}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.inStock ? viLocale.product.addToCart : viLocale.product.outOfStock}
        </Button>
      </CardFooter>
    </Card>
  )
}
