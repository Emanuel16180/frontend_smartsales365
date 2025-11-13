// app/api/users/admin/customers/route.ts

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ detail: "Authentication credentials were not provided." }, { status: 401 })
    }

    const backendUrl = new URL("https://backend-smartsales365.onrender.com/api/v1/users/admin/customers/")
    backendUrl.search = searchParams.toString()

    const backendResponse = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.json()
      return NextResponse.json(error, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Customers API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Customers API error" }, { status: 500 })
  }
}