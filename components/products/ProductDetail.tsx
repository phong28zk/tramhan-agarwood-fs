"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ShoppingCart, Heart, Share2, Minus, Plus, Star, Truck, Shield, RotateCcw, ArrowLeft } from "lucide-react"
import type { Product } from "../../types"
import { formatVNDCurrency, getFengShuiElementColor } from "../../utils"
import { useCartStore } from "../../store"
import { viLocale } from "../../locales/vi"

interface ProductDetailProps {
  product: Product
  onClose?: () => void
  onBack?: () => void
}

export function ProductDetail({ product, onClose, onBack }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0])
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  const currentPrice = selectedVariant?.price || product.price
  const currentStock = selectedVariant?.stockQuantity || product.stockQuantity

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant)
    // Would show success toast
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(currentStock, quantity + delta))
    setQuantity(newQuantity)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // Would save to wishlist
  }

  const handleShare = () => {
    // Would implement sharing functionality
    navigator.share?.({
      title: product.name,
      text: product.description,
      url: window.location.href,
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back Button */}
      {onBack && (
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách sản phẩm
        </Button>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.images[selectedImageIndex] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=500&width=500&text=Sản phẩm"
              }}
            />
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex ? "border-amber-500" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            {/* Feng Shui Element */}
            {product.fengShuiProperties && (
              <Badge
                variant="outline"
                className={`mb-2 ${getFengShuiElementColor(product.fengShuiProperties.element)}`}
              >
                {viLocale.elements[product.fengShuiProperties.element]}
              </Badge>
            )}

            <h1 className="text-3xl font-bold text-balance mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1">(4.8) • 127 đánh giá</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-amber-600">{formatVNDCurrency(currentPrice)}</span>
              {selectedVariant && selectedVariant.price !== product.price && (
                <span className="text-lg text-muted-foreground line-through">{formatVNDCurrency(product.price)}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                currentStock <= 5 ? (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Chỉ còn {currentStock} sản phẩm
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {viLocale.product.inStock}
                  </Badge>
                )
              ) : (
                <Badge variant="destructive">{viLocale.product.outOfStock}</Badge>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Tùy chọn:</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariant(variant)}
                    className="min-w-[80px]"
                  >
                    {variant.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          {product.inStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock}
                    className="px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <span className="text-sm text-muted-foreground">{currentStock} sản phẩm có sẵn</span>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddToCart} className="flex-1 bg-amber-600 hover:bg-amber-700" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {viLocale.product.addToCart}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlist}
                  className={isWishlisted ? "text-red-500 border-red-200" : ""}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </Button>

                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Miễn phí vận chuyển</p>
              <p className="text-xs text-muted-foreground">Đơn từ 500k</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Bảo hành chính hãng</p>
              <p className="text-xs text-muted-foreground">12 tháng</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Đổi trả dễ dàng</p>
              <p className="text-xs text-muted-foreground">Trong 7 ngày</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Mô tả</TabsTrigger>
            <TabsTrigger value="fengshui">Phong thủy</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                  {/* Mock detailed description */}
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Đặc điểm nổi bật</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Chất liệu tự nhiên 100%, không pha trộn hóa chất</li>
                      <li>Được chế tác thủ công bởi nghệ nhân có kinh nghiệm</li>
                      <li>Hương thơm thanh tao, lưu lại lâu trong không gian</li>
                      <li>Phù hợp cho việc thờ cúng, thiền định và trang trí</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fengshui" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {product.fengShuiProperties ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Thông tin phong thủy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Nguyên tố:</h4>
                          <Badge className={getFengShuiElementColor(product.fengShuiProperties.element)}>
                            {viLocale.elements[product.fengShuiProperties.element]}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Mức năng lượng:</h4>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                  i < product.fengShuiProperties!.energyLevel ? "bg-amber-400" : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Lợi ích:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.fengShuiProperties.benefits.map((benefit, index) => (
                          <Badge key={index} variant="secondary">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Vị trí đặt:</h4>
                      <p className="text-muted-foreground">{product.fengShuiProperties.placement}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Cách sử dụng:</h4>
                      <p className="text-muted-foreground">{product.fengShuiProperties.usage}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Tương thích với:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.fengShuiProperties.compatibility.map((compat, index) => (
                          <Badge key={index} variant="outline">
                            {compat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sản phẩm này không có thông tin phong thủy cụ thể.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tính năng đánh giá sẽ được cập nhật sớm.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
