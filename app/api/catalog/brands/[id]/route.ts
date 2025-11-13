import { type NextRequest, NextResponse } from "next/server"

async function getAuthHeader(request: NextRequest) {
  const token = request.headers.get("Authorization")
  // Corregido: Devolver un objeto con clave explícita o un objeto vacío
  return token ? { Authorization: token } : {}
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const authHeader = await getAuthHeader(request)
    
    // --- INICIO DE CORRECCIÓN ---
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (authHeader.Authorization) {
      headers["Authorization"] = authHeader.Authorization
    }
    // --- FIN DE CORRECCIÓN ---

    const response = await fetch(`https://backend-smartsales365.onrender.com/api/v1/catalog/brands/${id}/`, {
      method: "GET",
      headers: headers, // Usar headers corregidos
    })

    if (!response.ok) throw new Error("Failed to fetch brand")
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Brand proxy error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const authHeader = await getAuthHeader(request)
    const body = await request.json()

    // --- INICIO DE CORRECCIÓN ---
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (authHeader.Authorization) {
      headers["Authorization"] = authHeader.Authorization
    }
    // --- FIN DE CORRECCIÓN ---

    const response = await fetch(`https://backend-smartsales365.onrender.com/api/v1/catalog/brands/${id}/`, {
      method: "PUT",
      headers: headers, // Usar headers corregidos
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error("Failed to update brand")
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Update brand error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const authHeader = await getAuthHeader(request)
    const body = await request.json()

    // --- INICIO DE CORRECCIÓN ---
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (authHeader.Authorization) {
      headers["Authorization"] = authHeader.Authorization
    }
    // --- FIN DE CORRECCIÓN ---

    const response = await fetch(`https://backend-smartsales365.onrender.com/api/v1/catalog/brands/${id}/`, {
      method: "PATCH",
      headers: headers, // Usar headers corregidos
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error("Failed to update brand")
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Patch brand error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const authHeader = await getAuthHeader(request)

    // --- INICIO DE CORRECCIÓN ---
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (authHeader.Authorization) {
      headers["Authorization"] = authHeader.Authorization
    }
    // --- FIN DE CORRECCIÓN ---

    const response = await fetch(`https://backend-smartsales365.onrender.com/api/v1/catalog/brands/${id}/`, {
      method: "DELETE",
      headers: headers, // Usar headers corregidos
    })

    if (!response.ok) throw new Error("Failed to delete brand")
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    console.error("[v0] Delete brand error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}
