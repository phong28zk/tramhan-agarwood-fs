"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { Search, Menu, ShoppingCart, User, Heart, Phone, MapPin } from "lucide-react"
import { CartDrawer } from "../cart/CartDrawer"
import { useCartStore } from "../../store"
import { viLocale } from "../../locales/vi"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const itemCount = useCartStore((state) => state.itemCount)

  const navigationItems = [
    { label: viLocale.navigation.home, href: "/" },
    { label: viLocale.navigation.products, href: "/products" },
    { label: viLocale.navigation.about, href: "/about" },
    { label: viLocale.navigation.contact, href: "/contact" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="border-b bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">{viLocale.business.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="hidden md:inline">{viLocale.business.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="hidden sm:inline">{viLocale.business.hours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">TH</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-amber-800">{viLocale.business.name}</h1>
              <p className="text-xs text-muted-foreground">{viLocale.business.tagline}</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm phong thủy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Mobile */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="w-4 h-4" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Heart className="w-4 h-4" />
            </Button>

            {/* Account */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <User className="w-4 h-4" />
            </Button>

            {/* Cart */}
            <CartDrawer>
              <Button variant="ghost" size="sm" className="relative">
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
            </CartDrawer>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-6 py-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </form>

                  {/* Navigation */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>

                  {/* Mobile Actions */}
                  <div className="space-y-2 pt-4 border-t">
                    <Button variant="ghost" className="w-full justify-start">
                      <Heart className="w-4 h-4 mr-2" />
                      Yêu thích
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Tài khoản
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6 pb-4">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
