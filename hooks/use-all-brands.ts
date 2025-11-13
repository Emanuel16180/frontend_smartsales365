"use client"

import { useState, useEffect } from "react"
import BrandsService, { type Brand } from "@/lib/brands-service"

interface UseAllBrandsResult {
  brands: Brand[]
  isLoading: boolean
  error: string | null
}

export function useAllBrands(): UseAllBrandsResult {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllBrands = async () => {
      try {
        setIsLoading(true)
        setError(null)
        let allBrands: Brand[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await BrandsService.getBrands(page)
          allBrands = [...allBrands, ...response.results]
          hasMore = response.next !== null
          page++
        }

        setBrands(allBrands)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error fetching brands"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllBrands()
  }, [])

  return { brands, isLoading, error }
}
