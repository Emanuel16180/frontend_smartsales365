import AuthService from "./auth-service"

const API_BASE_URL = "/api/catalog"

export interface Category {
  id: number
  name: string
  parent: number | null
  children: Category[]
  description: string | null
}

export interface CategoriesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Category[]
}

class CategoriesService {
  private static getHeaders() {
    const token = AuthService.getAccessToken()
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  static async getCategories(page = 1): Promise<CategoriesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/?page=${page}`, {
        method: "GET",
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch categories")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async createCategory(data: { name: string; parent?: number }): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create category")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}/`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update category")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async deleteCategory(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}/`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to delete category")
    } catch (error) {
      throw error
    }
  }
}

export default CategoriesService
