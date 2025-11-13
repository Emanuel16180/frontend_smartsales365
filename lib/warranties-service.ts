import AuthService from "./auth-service"

const API_BASE_URL = "/api/catalog"

export interface Provider {
  id: number
  name: string
  contact_email: string
  contact_phone: string
}

export interface Warranty {
  id: number
  title: string
  terms: string
  duration_days: number
  provider: Provider
}

export interface WarrantiesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Warranty[]
}

class WarrantiesService {
  private static getHeaders() {
    const token = AuthService.getAccessToken()
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  static async getWarranties(page = 1): Promise<WarrantiesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/warranties/?page=${page}`, {
        method: "GET",
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch warranties")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async createWarranty(data: {
    title: string
    terms: string
    duration_days: number
    provider_id: number
  }): Promise<Warranty> {
    try {
      const response = await fetch(`${API_BASE_URL}/warranties/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create warranty")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async updateWarranty(id: number, data: Partial<Warranty>): Promise<Warranty> {
    try {
      const response = await fetch(`${API_BASE_URL}/warranties/${id}/`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update warranty")
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async deleteWarranty(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/warranties/${id}/`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to delete warranty")
    } catch (error) {
      throw error
    }
  }
}

export default WarrantiesService
