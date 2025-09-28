"use client"

import { useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { ArrowRight, Truck, Shield, RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProductCard } from "../components/products/ProductCard"
import { mockProducts, getCategories } from "../data/products"
import { useProductsStore } from "../store"
import { viLocale } from "../locales/vi"
import { HeroSection } from "../components/home/HeroSection"
import { TestimonialsSection } from "../components/home/TestimonialsSection"

export default function HomePage() {
  const { setProducts } = useProductsStore()

  useEffect(() => {
    setProducts(mockProducts)
  }, [setProducts])

  const featuredProducts = mockProducts.slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold">Miễn phí vận chuyển</h3>
              <p className="text-muted-foreground">Miễn phí giao hàng toàn quốc cho đơn hàng từ 500.000đ</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold">Chất lượng đảm bảo</h3>
              <p className="text-muted-foreground">100% sản phẩm tự nhiên, được kiểm định chất lượng nghiêm ngặt</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <RotateCcw className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold">Đổi trả dễ dàng</h3>
              <p className="text-muted-foreground">Hỗ trợ đổi trả trong vòng 7 ngày nếu không hài lòng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá những sản phẩm trầm hương và phong thủy được yêu thích nhất, được chọn lọc kỹ càng để mang đến
              cho bạn những trải nghiệm tuyệt vời nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="featured"
                onViewDetails={(product) => {
                  window.location.href = `/products/${product.id}`
                }}
              />
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg">
              Xem tất cả sản phẩm
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Danh mục sản phẩm</h2>
            <p className="text-muted-foreground">Tìm hiểu các danh mục sản phẩm phong thủy đa dạng của chúng tôi</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {getCategories().map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Bắt đầu hành trình phong thủy của bạn</h2>
            <p className="text-amber-100 text-lg">
              Liên hệ với chúng tôi để được tư vấn miễn phí về các sản phẩm phong thủy phù hợp với bạn và gia đình.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Tư vấn miễn phí
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-amber-600 bg-transparent"
              >
                Gọi ngay: +84 90 123 4567
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
