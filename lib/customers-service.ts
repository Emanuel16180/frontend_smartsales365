// lib/customers-service.ts

import AuthService from "./auth-service"

// Usamos el proxy de Next.js
const API_BASE_URL = "/api/users/admin/customers"

export interface Customer {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  phone_number: string
  address: string
  full_name: string
}

export interface CustomersResponse {
  count: number
  next: string | null
  previous: string | null
  results: Customer[]
}

class CustomersService {
  private static getHeaders() {
    const token = AuthService.getAccessToken()
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  static async getCustomers(page = 1): Promise<CustomersResponse> {
    try {
      // Añadimos el parámetro de página a la URL del proxy
      const response = await fetch(`${API_BASE_URL}?page=${page}`, {
        method: "GET",
        headers: this.getHeaders(),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to fetch customers")
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}

export default CustomersService