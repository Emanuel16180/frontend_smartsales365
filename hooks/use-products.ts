"use client"

import { useState, useEffect } from "react"
import ProductsService, { type Product, type ProductListResponse } from "@/lib/products-service"

interface UseProductsResult {
  products: Product[]
  data: ProductListResponse
  isLoading: boolean
  error: string | null
  currentPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => Promise<void>
  refetch: () => Promise<void>
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [data, setData] = useState<ProductListResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response: ProductListResponse = await ProductsService.getProducts(page)
      const normalizedProducts = response.results.map((product) => ({
        ...product,
        price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
        stock: typeof product.stock === "string" ? Number.parseInt(product.stock, 10) : product.stock,
      }))
      setProducts(normalizedProducts)
      setData(response)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching products"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [])

  return {
    products,
    data,
    isLoading,
    error,
    currentPage,
    totalCount: data.count,
    hasNextPage: data.next !== null,
    hasPreviousPage: data.previous !== null,
    goToPage: fetchProducts,
    refetch: () => fetchProducts(currentPage),
  }
}
