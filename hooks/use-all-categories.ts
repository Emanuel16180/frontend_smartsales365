"use client"

import { useState, useEffect } from "react"
import CategoriesService, { type Category } from "@/lib/categories-service"
import { flattenCategories } from "@/lib/category-utils"

interface UseAllCategoriesResult {
  categories: Category[]
  flatCategories: ReturnType<typeof flattenCategories>
  isLoading: boolean
  error: string | null
}

export function useAllCategories(): UseAllCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setIsLoading(true)
        setError(null)
        let allCategories: Category[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await CategoriesService.getCategories(page)
          allCategories = [...allCategories, ...response.results]
          hasMore = response.next !== null
          page++
        }

        setCategories(allCategories)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error fetching categories"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllCategories()
  }, [])

  const flatCategories = flattenCategories(categories)

  return { categories, flatCategories, isLoading, error }
}
