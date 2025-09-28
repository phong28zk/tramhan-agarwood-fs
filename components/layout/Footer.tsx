"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react"
import { useLocalization } from "@/hooks/useLocalization"

export function Footer() {
  const { t, formatCurrency } = useLocalization()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-amber-600 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Đăng ký nhận tin tức và ưu đãi đặc biệt</h3>
            <p className="text-amber-100 mb-6">
              Nhận thông tin về sản phẩm mới, kiến thức phong thủy và các chương trình khuyến mãi hấp dẫn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input type="email" placeholder="Nhập email của bạn" className="bg-white text-gray-900 border-0" />
              <Button variant="secondary" className="bg-white text-amber-600 hover:bg-gray-100">
                Đăng ký
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-amber-400 mb-4">Trầm Hân Agarwood</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Chuyên cung cấp các sản phẩm trầm hương và phong thủy chất lượng cao, được chế tác thủ công bởi nghệ
                  nhân có kinh nghiệm lâu năm.
                </p>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-semibold mb-3">Kết nối với chúng tôi</h4>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 hover:bg-amber-600 hover:border-amber-600 bg-transparent"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 hover:bg-amber-600 hover:border-amber-600 bg-transparent"
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 hover:bg-amber-600 hover:border-amber-600 bg-transparent"
                  >
                    <Youtube className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="/products" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Sản phẩm
                  </a>
                </li>
                <li>
                  <a href="/categories/tram-huong" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Trầm hương
                  </a>
                </li>
                <li>
                  <a href="/categories/vong-tay" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Vòng tay phong thủy
                  </a>
                </li>
                <li>
                  <a
                    href="/categories/tuong-phong-thuy"
                    className="text-gray-300 hover:text-amber-400 transition-colors"
                  >
                    Tượng phong thủy
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ khách hàng</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="/shipping-policy" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Chính sách vận chuyển
                  </a>
                </li>
                <li>
                  <a href="/return-policy" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Chính sách đổi trả
                  </a>
                </li>
                <li>
                  <a href="/warranty" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Chính sách bảo hành
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a href="/terms-of-service" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Điều khoản dịch vụ
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-300 hover:text-amber-400 transition-colors">
                    Câu hỏi thường gặp
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Thông tin liên hệ</h4>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">
                      123 Đường Nguyễn Huệ, Quận 1<br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href="tel:+84901234567" className="text-gray-300 hover:text-amber-400 transition-colors">
                    +84 90 123 4567
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href="mailto:info@tramhan.vn" className="text-gray-300 hover:text-amber-400 transition-colors">
                    info@tramhan.vn
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300">
                    <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                    <p>Thứ 7 - CN: 9:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Bottom Footer */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">© 2025 Trầm Hân Agarwood. Tất cả quyền được bảo lưu.</div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Phương thức thanh toán:</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  VISA
                </div>
                <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  MC
                </div>
                <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                  VNP
                </div>
                <div className="w-8 h-5 bg-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">
                  MM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
