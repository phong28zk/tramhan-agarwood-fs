"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    location: "TP. Hồ Chí Minh",
    avatar: "/avatars/customer-1.jpg",
    rating: 5,
    content:
      "Sản phẩm trầm hương rất chất lượng, mùi hương thơm tự nhiên và lâu phai. Tôi đã mua nhiều lần và luôn hài lòng với chất lượng.",
    product: "Trầm hương Khánh Hòa",
  },
  {
    id: 2,
    name: "Trần Văn Minh",
    location: "Hà Nội",
    avatar: "/avatars/customer-2.jpg",
    rating: 5,
    content:
      "Vòng tay trầm hương đẹp và có năng lượng tốt. Đeo vào cảm thấy tâm trạng thư thái hơn. Chất lượng tuyệt vời!",
    product: "Vòng tay trầm hương 108 hạt",
  },
  {
    id: 3,
    name: "Lê Thị Hương",
    location: "Đà Nẵng",
    avatar: "/avatars/customer-3.jpg",
    rating: 5,
    content:
      "Dịch vụ tư vấn phong thủy rất chuyên nghiệp. Các sản phẩm được gợi ý phù hợp với mệnh và không gian nhà tôi.",
    product: "Tư vấn phong thủy",
  },
  {
    id: 4,
    name: "Phạm Đức Thành",
    location: "Cần Thơ",
    avatar: "/avatars/customer-4.jpg",
    rating: 5,
    content:
      "Tượng Phật bằng trầm hương rất đẹp và tinh xảo. Đặt trong phòng thờ tạo không gian linh thiêng, trang nghiêm.",
    product: "Tượng Phật Di Lặc",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Khách hàng nói gì về chúng tôi</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Hàng nghìn khách hàng đã tin tưởng và hài lòng với sản phẩm, dịch vụ của Trầm Hân Agarwood
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-amber-400" />

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 text-sm leading-relaxed">"{testimonial.content}"</p>

                  {/* Product */}
                  <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full inline-block">
                    {testimonial.product}
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 pt-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback className="bg-amber-100 text-amber-700">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-amber-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">2,500+</div>
            <div className="text-sm text-muted-foreground">Khách hàng hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">15+</div>
            <div className="text-sm text-muted-foreground">Năm kinh nghiệm</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Sản phẩm chất lượng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">99%</div>
            <div className="text-sm text-muted-foreground">Tỷ lệ hài lòng</div>
          </div>
        </div>
      </div>
    </section>
  )
}
