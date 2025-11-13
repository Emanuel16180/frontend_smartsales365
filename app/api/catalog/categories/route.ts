import { type NextRequest, NextResponse } from "next/server"

async function getAuthHeader(request: NextRequest) {
  const token = request.headers.get("Authorization")
  return token ? { Authorization: token } : {}
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = await getAuthHeader(request)
    const response = await fetch("https://smartsales365-backend.onrender.com/api/v1/catalog/categories/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
    })

    if (!response.ok) throw new Error("Failed to fetch categories")
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Categories proxy error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = await getAuthHeader(request)
    const body = await request.json()

    const response = await fetch("https://smartsales365-backend.onrender.com/api/v1/catalog/categories/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error("Failed to create category")
    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Create category error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}
