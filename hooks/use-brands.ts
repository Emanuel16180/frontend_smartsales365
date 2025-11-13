"use client"

import { useState, useEffect } from "react"
import BrandsService, { type Brand, type BrandsResponse } from "@/lib/brands-service"

interface UseBrandsResult {
  brands: Brand[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => Promise<void>
  refetch: () => Promise<void>
}

export function useBrands(): UseBrandsResult {
  const [brands, setBrands] = useState<Brand[]>([])
  const [data, setData] = useState<BrandsResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchBrands = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response: BrandsResponse = await BrandsService.getBrands(page)
      setBrands(response.results)
      setData(response)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching brands"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands(1)
  }, [])

  return {
    brands,
    isLoading,
    error,
    currentPage,
    totalCount: data.count,
    hasNextPage: data.next !== null,
    hasPreviousPage: data.previous !== null,
    goToPage: fetchBrands,
    refetch: () => fetchBrands(currentPage),
  }
}
