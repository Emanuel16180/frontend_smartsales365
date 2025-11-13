"use client"

import { useState, useEffect } from "react"
import CategoriesService, { type Category, type CategoriesResponse } from "@/lib/categories-service"
import { flattenCategories } from "@/lib/category-utils"

interface UseCategoriesResult {
  categories: Category[]
  flatCategories: any[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => Promise<void>
  refetch: () => Promise<void>
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [data, setData] = useState<CategoriesResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchCategories = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response: CategoriesResponse = await CategoriesService.getCategories(page)
      setCategories(response.results)
      setData(response)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching categories"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories(1)
  }, [])

  const flatCategories = flattenCategories(categories)

  return {
    categories,
    flatCategories,
    isLoading,
    error,
    currentPage,
    totalCount: data.count,
    hasNextPage: data.next !== null,
    hasPreviousPage: data.previous !== null,
    goToPage: fetchCategories,
    refetch: () => fetchCategories(currentPage),
  }
}
