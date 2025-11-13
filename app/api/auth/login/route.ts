import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Proxy: Forwarding login to backend:", body.email)

    // Forward request to backend
    const backendResponse = await fetch("https://backend-smartsales365.onrender.com/api/v1/users/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] Proxy: Backend response status:", backendResponse.status)

    if (!backendResponse.ok) {
      const error = await backendResponse.json()
      console.log("[v0] Proxy: Backend error:", error)
      return NextResponse.json(error, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    console.log("[v0] Proxy: Login successful")

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Proxy error" }, { status: 500 })
  }
}
