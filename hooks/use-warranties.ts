"use client"

import { useState, useEffect } from "react"
import WarrantiesService, { type Warranty, type WarrantiesResponse } from "@/lib/warranties-service"

interface UseWarrantiesResult {
  warranties: Warranty[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => Promise<void>
  refetch: () => Promise<void>
}

export function useWarranties(): UseWarrantiesResult {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [data, setData] = useState<WarrantiesResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchWarranties = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response: WarrantiesResponse = await WarrantiesService.getWarranties(page)
      setWarranties(response.results)
      setData(response)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching warranties"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWarranties(1)
  }, [])

  return {
    warranties,
    isLoading,
    error,
    currentPage,
    totalCount: data.count,
    hasNextPage: data.next !== null,
    hasPreviousPage: data.previous !== null,
    goToPage: fetchWarranties,
    refetch: () => fetchWarranties(currentPage),
  }
}
