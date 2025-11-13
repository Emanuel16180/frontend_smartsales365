// hooks/use-customers.ts

"use client"

import { useState, useEffect } from "react"
import CustomersService, { type Customer, type CustomersResponse } from "@/lib/customers-service"

interface UseCustomersResult {
  customers: Customer[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => Promise<void>
  refetch: () => Promise<void>
}

export function useCustomers(): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [data, setData] = useState<CustomersResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchCustomers = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response: CustomersResponse = await CustomersService.getCustomers(page)
      setCustomers(response.results)
      setData(response)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching customers"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers(1)
  }, [])

  return {
    customers,
    isLoading,
    error,
    currentPage,
    totalCount: data.count,
    hasNextPage: data.next !== null,
    hasPreviousPage: data.previous !== null,
    goToPage: fetchCustomers,
    refetch: () => fetchCustomers(currentPage),
  }
}