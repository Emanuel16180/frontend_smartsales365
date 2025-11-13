import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const backendResponse = await fetch("https://backend-smartsales365.onrender.com/api/v1/users/login/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.json()
      return NextResponse.json(error, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Refresh proxy error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}
