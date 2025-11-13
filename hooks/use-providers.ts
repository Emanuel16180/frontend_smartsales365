"use client"

import { useState, useEffect } from "react"
import ProvidersService, { type Provider, type ProvidersResponse } from "@/lib/providers-service"

interface UseProvidersResult {
  providers: Provider[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => Promise<void>
  refetch: () => Promise<void>
}

export function useProviders(): UseProvidersResult {
  const [providers, setProviders] = useState<Provider[]>([])
  const [data, setData] = useState<ProvidersResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProviders = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response: ProvidersResponse = await ProvidersService.getProviders(page)
      setProviders(response.results)
      setData(response)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching providers"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders(1)
  }, [])

  return {
    providers,
    isLoading,
    error,
    currentPage,
    totalCount: data.count,
    hasNextPage: data.next !== null,
    hasPreviousPage: data.previous !== null,
    goToPage: fetchProviders,
    refetch: () => fetchProviders(currentPage),
  }
}
