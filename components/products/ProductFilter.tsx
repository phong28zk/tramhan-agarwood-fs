"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Slider } from "../ui/slider"
import { Search, X } from "lucide-react"
import type { Product, ProductFilters } from "../../types"
import { formatVNDCurrency, debounce } from "../../utils"
import { viLocale } from "../../locales/vi"

interface ProductFilterProps {
  filters: ProductFilters
  onFiltersChange: (filters: Partial<ProductFilters>) => void
  onClearFilters: () => void
  products: Product[]
}

export function ProductFilter({ filters, onFiltersChange, onClearFilters, products }: ProductFilterProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "")
  const [priceRange, setPriceRange] = useState([filters.priceRange?.min || 0, filters.priceRange?.max || 5000000])

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    onFiltersChange({ searchQuery: query || undefined })
  }, 300)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    onFiltersChange({
      priceRange: {
        min: values[0],
        max: values[1],
      },
    })
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.map((p) => p.category)))

  // Get unique feng shui elements
  const fengShuiElements = Array.from(
    new Set(products.filter((p) => p.fengShuiProperties).map((p) => p.fengShuiProperties!.element)),
  )

  // Get price range from products
  const minPrice = Math.min(...products.map((p) => p.price))
  const maxPrice = Math.max(...products.map((p) => p.price))

  const hasActiveFilters = Object.keys(filters).some((key) => filters[key as keyof ProductFilters] !== undefined)

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{viLocale.common.filter}</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              {viLocale.common.clear}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">{viLocale.common.search}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Danh mục</Label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) => onFiltersChange({ category: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{viLocale.common.all}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {viLocale.categories[category as keyof typeof viLocale.categories] || category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <Label>Khoảng giá</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={maxPrice}
              min={minPrice}
              step={50000}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatVNDCurrency(priceRange[0])}</span>
            <span>{formatVNDCurrency(priceRange[1])}</span>
          </div>
        </div>

        {/* Feng Shui Elements */}
        {fengShuiElements.length > 0 && (
          <div className="space-y-2">
            <Label>Nguyên tố phong thủy</Label>
            <Select
              value={filters.fengShuiElement || "all"}
              onValueChange={(value) => onFiltersChange({ fengShuiElement: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nguyên tố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{viLocale.common.all}</SelectItem>
                {fengShuiElements.map((element) => (
                  <SelectItem key={element} value={element}>
                    {viLocale.elements[element as keyof typeof viLocale.elements]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stock Status */}
        <div className="space-y-3">
          <Label>Tình trạng</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={filters.inStock === true}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    inStock: checked ? true : undefined,
                  })
                }
              />
              <Label htmlFor="inStock" className="text-sm">
                {viLocale.product.inStock}
              </Label>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <Label>Sắp xếp theo</Label>
          <Select
            value={filters.sortBy || "default"}
            onValueChange={(value) => {
              if (value) {
                onFiltersChange({
                  sortBy: value as ProductFilters["sortBy"],
                  sortOrder: "asc",
                })
              } else {
                onFiltersChange({
                  sortBy: undefined,
                  sortOrder: undefined,
                })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn cách sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Mặc định</SelectItem>
              <SelectItem value="name">Tên A-Z</SelectItem>
              <SelectItem value="price">Giá thấp đến cao</SelectItem>
              <SelectItem value="date">Mới nhất</SelectItem>
              <SelectItem value="popularity">Phổ biến</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        {filters.sortBy && (
          <div className="space-y-2">
            <Label>Thứ tự</Label>
            <Select
              value={filters.sortOrder || "asc"}
              onValueChange={(value) =>
                onFiltersChange({
                  sortOrder: value as "asc" | "desc",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Tăng dần</SelectItem>
                <SelectItem value="desc">Giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
