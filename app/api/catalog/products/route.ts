import { type NextRequest, NextResponse } from "next/server"

async function getAuthHeader(request: NextRequest) {
  const token = request.headers.get("Authorization")
  return token ? { Authorization: token } : {}
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = await getAuthHeader(request)
    const url = new URL(request.url)
    const params = url.searchParams.toString()

    const response = await fetch(`https://smartsales365-backend.onrender.com/api/v1/catalog/products/?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
    })

    if (!response.ok) throw new Error("Failed to fetch products")
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Products proxy error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = await getAuthHeader(request)
    const body = await request.formData()

    const response = await fetch("https://smartsales365-backend.onrender.com/api/v1/catalog/products/", {
      method: "POST",
      headers: authHeader,
      body: body,
    })

    if (!response.ok) throw new Error("Failed to create product")
    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Create product error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}
