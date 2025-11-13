import AuthService from "./auth-service"

const API_BASE_URL = "/api/catalog"

export interface Provider {
  id: number
  name: string
  contact_email: string
  contact_phone: string
}

export interface ProvidersResponse {
  count: number
  next: string | null
  previous: string | null
  results: Provider[]
}

class ProvidersService {
  private static getHeaders() {
    const token = AuthService.getAccessToken()
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  static async getProviders(page = 1): Promise<ProvidersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/?page=${page}`, {
        method: "GET",
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch providers")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async createProvider(data: {
    name: string
    contact_email: string
    contact_phone: string
  }): Promise<Provider> {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create provider")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async updateProvider(id: number, data: Partial<Provider>): Promise<Provider> {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${id}/`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update provider")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async deleteProvider(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${id}/`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to delete provider")
    } catch (error) {
      throw error
    }
  }
}

export default ProvidersService
