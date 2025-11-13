"use client"

import AuthService from "@/lib/auth-service"

// Define la URL base de tu backend
const API_BASE_URL = "https://backend-smartsales365.onrender.com"

interface FetchSalesParams {
  page?: number
  client_search?: string
  product_search?: string
  fecha_inicio?: string
  fecha_fin?: string
  monto_min?: string
  monto_max?: string
  status?: string
  month?: string
  year?: string
}

export async function fetchSalesData(params: FetchSalesParams) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("page", (params.page || 1).toString())

    if (params.client_search) queryParams.append("client_search", params.client_search)
    if (params.product_search) queryParams.append("product_search", params.product_search)
    if (params.fecha_inicio) queryParams.append("fecha_inicio", params.fecha_inicio)
    if (params.fecha_fin) queryParams.append("fecha_fin", params.fecha_fin)
    if (params.monto_min) queryParams.append("monto_min", params.monto_min)
    if (params.monto_max) queryParams.append("monto_max", params.monto_max)
    if (params.status && params.status !== "all") queryParams.append("status", params.status)
    if (params.month && params.month !== "all") queryParams.append("month", params.month)
    if (params.year) queryParams.append("year", params.year)

    const token = AuthService.getAccessToken()

    if (!token) {
      return {
        success: false,
        error: "No authentication token found. Please log in.",
      }
    }

    // Esta función ya usa el proxy /api/sales, lo cual está bien.
    const response = await fetch(`/api/sales?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error("[v0] API Error:", response.status, response.statusText)
      const error = await response.json().catch(() => ({}))
      return {
        success: false,
        error: error.detail || `HTTP Error: ${response.status}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Fetch error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export async function generateReport(filters: Omit<FetchSalesParams, "page">, reportType: "pdf" | "csv" = "csv") {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("report_type", reportType)

    if (filters.client_search) queryParams.append("client_search", filters.client_search)
    if (filters.product_search) queryParams.append("product_search", filters.product_search)
    if (filters.fecha_inicio) queryParams.append("fecha_inicio", filters.fecha_inicio)
    if (filters.fecha_fin) queryParams.append("fecha_fin", filters.fecha_fin)
    if (filters.monto_min) queryParams.append("monto_min", filters.monto_min)
    if (filters.monto_max) queryParams.append("monto_max", filters.monto_max)
    if (filters.status && filters.status !== "all") queryParams.append("status", filters.status)
    if (filters.month && filters.month !== "all") queryParams.append("month", filters.month)
    if (filters.year) queryParams.append("year", filters.year)

    const token = AuthService.getAccessToken()

    if (!token) {
      return {
        success: false,
        error: "No authentication token found. Please log in.",
      }
    }

    // ¡CORRECCIÓN AQUÍ! Se usa la URL completa del backend.
    const response = await fetch(`${API_BASE_URL}/api/v1/reports/admin/report/?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text().catch(() => "Error al generar reporte")
      return {
        success: false,
        error: error || `HTTP Error: ${response.status}`,
      }
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte_ventas_${new Date().toISOString().split("T")[0]}.${reportType}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true }
  } catch (error) {
    console.error("[v0] Generate report error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al generar reporte",
    }
  }
}

export async function generateDynamicReport(prompt: string) {
  try {
    const token = AuthService.getAccessToken()

    if (!token) {
      return {
        success: false,
        error: "No authentication token found. Please log in.",
      }
    }

    // ¡CORRECCIÓN AQUÍ! Se usa la URL completa del backend.
    const response = await fetch(`${API_BASE_URL}/api/v1/reports/dynamic-report/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return {
        success: false,
        error: error.detail || error.prompt || `HTTP Error: ${response.status}`,
      }
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url

    // Determine file type from content-type header
    const contentType = response.headers.get("content-type")
    let ext = "csv"
    if (contentType?.includes("pdf")) ext = "pdf"
    else if (contentType?.includes("excel")) ext = "xlsx"

    a.download = `reporte_ia_${new Date().toISOString().split("T")[0]}.${ext}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true }
  } catch (error) {
    console.error("[v0] Dynamic report error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al generar reporte",
    }
  }
}