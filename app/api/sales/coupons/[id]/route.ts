import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = "https://backend-smartsales365.onrender.com/api/v1/sales/coupons/"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get("authorization")
  const id = params.id
  
  try {
    const res = await fetch(`${BACKEND_URL}${id}/`, {
      method: "DELETE",
      headers: { Authorization: authHeader || "" },
    })
    if (res.status === 204) return new NextResponse(null, { status: 204 })
    return NextResponse.json({ error: "Error al eliminar" }, { status: res.status })
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get("authorization")
  const id = params.id

  try {
    const body = await request.json()
    const res = await fetch(`${BACKEND_URL}${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: authHeader || "" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ error: "Error actualizando cupón" }, { status: 500 })
  }
}