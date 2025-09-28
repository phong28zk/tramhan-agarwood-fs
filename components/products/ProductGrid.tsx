"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "./ProductCard"
import { ProductFilter } from "./ProductFilter"
import { Button } from "../ui/button"
import { Grid, List, SlidersHorizontal } from "lucide-react"
import type { Product, ProductFilters } from "../../types"
import { searchProducts } from "../../utils"
import { viLocale } from "../../locales/vi"

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onProductClick?: (product: Product) => void
}

export function ProductGrid({ products, loading = false, onProductClick }: ProductGridProps) {
  const [filters, setFilters] = useState<ProductFilters>({})
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (filters.searchQuery) {
      filtered = searchProducts(filtered, filters.searchQuery)
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category)
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        (p) =>
          p.price >= (filters.priceRange?.min || 0) && p.price <= (filters.priceRange?.max || Number.POSITIVE_INFINITY),
      )
    }

    // Feng shui element filter
    if (filters.fengShuiElement) {
      filtered = filtered.filter((p) => p.fengShuiProperties?.element === filters.fengShuiElement)
    }

    // Stock filter
    if (filters.inStock !== undefined) {
      filtered = filtered.filter((p) => p.inStock === filters.inStock)
    }

    // Sort products
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any

        switch (filters.sortBy) {
          case "name":
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case "price":
            aValue = a.price
            bValue = b.price
            break
          case "date":
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          case "popularity":
            // Mock popularity based on stock quantity (higher stock = more popular)
            aValue = a.stockQuantity
            bValue = b.stockQuantity
            break
          default:
            return 0
        }

        if (filters.sortOrder === "desc") {
          return aValue < bValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    return filtered
  }, [products, filters])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters toggle and view mode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{viLocale.navigation.products}</h2>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="sm:hidden">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {viLocale.common.filter}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Results count */}
          <span className="text-sm text-muted-foreground mr-4">{filteredProducts.length} sản phẩm</span>

          {/* View mode toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
          <ProductFilter
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={clearFilters}
            products={products}
          />
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-muted-foreground mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <Button onClick={clearFilters} variant="outline">
                {viLocale.common.clear} {viLocale.common.filter}
              </Button>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={viewMode === "list" ? "compact" : "default"}
                    onViewDetails={onProductClick}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    {viLocale.common.previous}
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {viLocale.common.next}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
