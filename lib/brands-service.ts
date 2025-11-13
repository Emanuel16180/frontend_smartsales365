import AuthService from "./auth-service"

const API_BASE_URL = "/api/catalog"

export interface Brand {
  id: number
  name: string
}

export interface BrandsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Brand[]
}

class BrandsService {
  private static getHeaders() {
    const token = AuthService.getAccessToken()
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  static async getBrands(page = 1): Promise<BrandsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brands/?page=${page}`, {
        method: "GET",
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch brands")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async createBrand(data: { name: string }): Promise<Brand> {
    try {
      const response = await fetch(`${API_BASE_URL}/brands/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create brand")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async updateBrand(id: number, data: Partial<Brand>): Promise<Brand> {
    try {
      const response = await fetch(`${API_BASE_URL}/brands/${id}/`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update brand")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async deleteBrand(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/brands/${id}/`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to delete brand")
    } catch (error) {
      throw error
    }
  }
}

export default BrandsService
