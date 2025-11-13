"use client"

import { useState, useEffect } from "react"
import WarrantiesService, { type Warranty } from "@/lib/warranties-service"

interface UseAllWarrantiesResult {
  warranties: Warranty[]
  isLoading: boolean
  error: string | null
}

export function useAllWarranties(): UseAllWarrantiesResult {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllWarranties = async () => {
      try {
        setIsLoading(true)
        setError(null)
        let allWarranties: Warranty[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await WarrantiesService.getWarranties(page)
          allWarranties = [...allWarranties, ...response.results]
          hasMore = response.next !== null
          page++
        }

        setWarranties(allWarranties)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error fetching warranties"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllWarranties()
  }, [])

  return { warranties, isLoading, error }
}
