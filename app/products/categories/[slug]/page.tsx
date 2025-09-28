import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getProductsByCategory, getCategories } from "../../../../data/products"
import { CategoryPageClient } from "./CategoryPageClient"

interface CategoryPageProps {
  params: { slug: string }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params

  const categories = getCategories()
  const currentCategory = categories.find(cat => cat.slug === slug)
  const categoryProducts = getProductsByCategory(slug)

  if (!currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Danh mục không tồn tại</h1>
          <Link href="/products" className="inline-block">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
              Quay lại sản phẩm
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/products" className="inline-flex items-center mb-4 p-0 h-auto font-normal text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại tất cả sản phẩm
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{currentCategory.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{currentCategory.name}</h1>
            <p className="text-muted-foreground">
              {categoryProducts.length} sản phẩm • Trầm Hân Agarwood
            </p>
          </div>
        </div>
      </div>

      <CategoryPageClient
        currentCategory={currentCategory}
        categoryProducts={categoryProducts}
      />
    </div>
  )
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getCategories()

  return categories.map((category) => ({
    slug: category.slug,
  }))
}