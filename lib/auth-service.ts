// lib/auth-service.ts

const API_BASE_URL = "/api/auth" // Use local proxy instead of external backend

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

class AuthService {
  private static readonly ACCESS_TOKEN_KEY = "smartsalas_access_token"
  private static readonly REFRESH_TOKEN_KEY = "smartsalas_refresh_token"

  // Login with email and password
  static async login(credentials: LoginRequest): Promise<AuthTokens> {
    try {
      const loginUrl = `${API_BASE_URL}/login` 

      console.log("[v0] Login attempt:", {
        url: loginUrl,
        email: credentials.email,
        timestamp: new Date().toISOString(),
      })

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      }).catch((error) => {
        console.error("[v0] Network error caught:", error)
        throw new Error(`Network error: ${error.message}`)
      })

      console.log("[v0] Login response status:", response.status, response.statusText)

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        let error

        if (contentType?.includes("application/json")) {
          error = await response.json()
          console.log("[v0] Login error response:", error)
          throw new Error(error.detail || error.message || "Login failed")
        } else {
          const text = await response.text()
          console.log("[v0] Non-JSON error response:", text)
          throw new Error(`Server error (${response.status}): ${text}`)
        }
      }

      const data: LoginResponse = await response.json()
      console.log("[v0] Login successful, tokens received")

      // Store tokens in localStorage
      this.setTokens(data.access, data.refresh)

      return {
        accessToken: data.access,
        refreshToken: data.refresh,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("[v0] Login error details:", errorMessage)
      throw error
    }
  }

  static async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        this.clearTokens()
        throw new Error("Token refresh failed")
      }

      const data: { access: string } = await response.json()
      
      // --- CORRECCIÓN AQUÍ ---
      // Asegurarse de que localStorage solo se llame en el cliente
      if (typeof window !== "undefined") {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, data.access)
      }

      return data.access
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  // Set tokens in localStorage
  static setTokens(accessToken: string, refreshToken: string): void {
    // --- CORRECCIÓN AQUÍ ---
    // Añadida la comprobación de 'window'
    if (typeof window === "undefined") return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  // Get access token
  static getAccessToken(): string | null {
    // --- CORRECCIÓN AQUÍ ---
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    // --- CORRECCIÓN AQUÍ ---
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  // Clear tokens
  static clearTokens(): void {
    // --- CORRECCIÓN AQUÍ ---
    if (typeof window === "undefined") return
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }

  // Logout
  static logout(): void {
    this.clearTokens()
  }
}

export default AuthService