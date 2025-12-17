import { type NextRequest, NextResponse } from "next/server"

// Tu URL de Backend en Render
const BACKEND_URL = "https://backend-smartsales365.onrender.com/api/v1/sales/coupons/"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const res = await fetch(BACKEND_URL, {
      headers: { "Content-Type": "application/json", Authorization: authHeader },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ error: "Error creando cupón" }, { status: 500 })
  }
}