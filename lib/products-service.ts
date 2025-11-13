import AuthService from "./auth-service"
import FormData from "form-data"

const API_BASE_URL = "/api/catalog"

export interface Category {
  id: number
  name: string
  parent?: number | null
  children?: any[]
  description?: string | null
}

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

export interface Brand {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: string | number
  stock: number
  category: Category | null
  warranty: Warranty | null
  brand: Brand | null
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface ProductListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

export interface ProductCreateData {
  name: string
  price: number
  stock: number
  brand_id: number
  category_id?: number
  image_upload?: File
  description?: string
}

class ProductsService {
  // Get authorization headers
  private static getHeaders() {
    const token = AuthService.getAccessToken()
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  // Get all products
  static async getProducts(page = 1): Promise<ProductListResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/?page=${page}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data: ProductListResponse = await response.json()
      return {
        ...data,
        results: data.results.map((product) => ({
          ...product,
          price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
        })),
      }
    } catch (error) {
      throw error
    }
  }

  // Get single product
  static async getProduct(id: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch product")
      }

      const product: Product = await response.json()
      return {
        ...product,
        price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
      }
    } catch (error) {
      throw error
    }
  }

  // Create product
  static async createProduct(data: ProductCreateData): Promise<Product> {
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("price", data.price.toString())
      formData.append("stock", data.stock.toString())
      formData.append("brand_id", data.brand_id.toString())
      if (data.category_id) formData.append("category_id", data.category_id.toString())
      if (data.description) formData.append("description", data.description)
      if (data.image_upload) formData.append("image_upload", data.image_upload)

      const token = AuthService.getAccessToken()
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to create product")
      }

      const product: Product = await response.json()
      return {
        ...product,
        price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
      }
    } catch (error) {
      throw error
    }
  }

  // Update product
  static async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to update product")
      }

      const product: Product = await response.json()
      return {
        ...product,
        price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
      }
    } catch (error) {
      throw error
    }
  }

  // Delete product
  static async deleteProduct(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      throw error
    }
  }
}

export default ProductsService
