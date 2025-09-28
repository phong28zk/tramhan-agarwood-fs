"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Play } from "lucide-react"
import { useLocalization } from "@/hooks/useLocalization"

export function HeroSection() {
  const { t } = useLocalization()

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-amber-600 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-red-600 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-orange-600 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                ✨ Tinh hoa phong thủy Việt Nam
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                <span className="text-amber-800">Trầm Hân</span>
                <br />
                <span className="text-gray-700">Agarwood</span>
                <br />
                <span className="text-2xl md:text-3xl text-muted-foreground font-normal">
                  Mang lại bình an và thịnh vượng
                </span>
              </h1>

              <p className="text-lg text-muted-foreground text-pretty max-w-lg">
                Chuyên cung cấp các sản phẩm trầm hương, phong thủy chất lượng cao. Được chế tác thủ công bởi nghệ nhân
                có kinh nghiệm, mang đến cho bạn những sản phẩm tinh túy nhất từ thiên nhiên.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                Khám phá sản phẩm
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-amber-600 text-amber-700 hover:bg-amber-50 bg-transparent"
              >
                <Play className="w-4 h-4 mr-2" />
                Xem video giới thiệu
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.9/5 từ 2,500+ khách hàng hài lòng</span>
              </div>

              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>15+ năm kinh nghiệm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>100% tự nhiên</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Miễn phí tư vấn</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src="/premium-agarwood-incense-sticks.jpg"
                alt="Trầm hương cao cấp Trầm Hân"
                className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl" />

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Đang có sẵn</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-amber-600 text-white rounded-2xl p-4 shadow-lg">
                <div className="text-sm font-medium">Miễn phí vận chuyển</div>
                <div className="text-xs opacity-90">Đơn hàng từ 500K</div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-200 rounded-full opacity-20 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
