import { type NextRequest, NextResponse } from "next/server"

async function getAuthHeader(request: NextRequest) {
  const token = request.headers.get("Authorization")
  return token ? { Authorization: token } : {}
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const authHeader = await getAuthHeader(request)
    const response = await fetch(`https://smartsales365-backend.onrender.com/api/v1/catalog/brands/${id}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
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

    const response = await fetch(`https://smartsales365-backend.onrender.com/api/v1/catalog/brands/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
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

    const response = await fetch(`https://smartsales365-backend.onrender.com/api/v1/catalog/brands/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
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
    const response = await fetch(`https://smartsales365-backend.onrender.com/api/v1/catalog/brands/${id}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
    })

    if (!response.ok) throw new Error("Failed to delete brand")
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    console.error("[v0] Delete brand error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}
