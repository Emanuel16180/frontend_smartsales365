"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Tag, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Pencil,
  TicketPercent
} from "lucide-react"
import AuthService from "@/lib/auth-service"

// Interfaz para los cupones
interface Coupon {
  id: number
  code: string
  discount_amount: number
  usage_limit: number
  used_count: number
  expiration_date: string | null
  active: boolean
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    code: "",
    discount_amount: "",
    usage_limit: "",
    expiration_date: "",
    active: true,
  })

  // --- CARGAR DATOS ---
  const fetchCoupons = async () => {
    try {
      const token = AuthService.getAccessToken()
      if (!token) return
      
      const res = await fetch("/api/sales/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCoupons(data.results || [])
      }
    } catch (error) {
      console.error("Error cargando cupones:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  // --- LÓGICA DE ESTADOS (Colores del semáforo) ---
  const getCouponStatus = (coupon: Coupon) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const expiration = coupon.expiration_date ? new Date(coupon.expiration_date) : null

    if (!coupon.active) {
      return { label: "INACTIVO", color: "bg-slate-100 text-slate-500 border-slate-200", icon: <Tag className="w-3 h-3"/> }
    }
    
    if (coupon.used_count >= coupon.usage_limit) {
      return { label: "AGOTADO", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertCircle className="w-3 h-3"/> }
    }

    if (expiration && today > expiration) {
      return { label: "VENCIDO", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <Calendar className="w-3 h-3"/> }
    }

    return { label: "ACTIVO", color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3 h-3"/> }
  }

  // --- ACCIONES DEL FORMULARIO ---
  const generateRandomCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData({ ...formData, code: `PROMO-${random}` })
  }

  const handleOpenCreate = () => {
    setFormData({ code: "", discount_amount: "", usage_limit: "", expiration_date: "", active: true })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discount_amount: coupon.discount_amount.toString(),
      usage_limit: coupon.usage_limit.toString(),
      expiration_date: coupon.expiration_date || "",
      active: coupon.active
    })
    setCurrentId(coupon.id)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const token = AuthService.getAccessToken()
      const url = isEditing ? `/api/sales/coupons/${currentId}` : "/api/sales/coupons"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          discount_amount: Number(formData.discount_amount),
          usage_limit: Number(formData.usage_limit),
          expiration_date: formData.expiration_date || null 
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchCoupons()
      } else {
        alert("Error al guardar el cupón")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if(!confirm("¿Seguro que quieres eliminar este cupón?")) return
    
    const token = AuthService.getAccessToken()
    await fetch(`/api/sales/coupons/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchCoupons()
  }

  // Formateador simple de fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha fin"
    return new Date(dateString).toLocaleDateString('es-ES', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <TicketPercent className="w-8 h-8 text-blue-600"/> Gestión de Cupones
          </h1>
          <p className="text-slate-600">Crea descuentos y monitorea su uso.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" /> Nuevo Cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Cupón" : "Crear Nuevo Descuento"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              
              {/* CÓDIGO */}
              <div className="grid gap-2">
                <Label>Código del Cupón</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ej: VERANO2025" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="font-mono uppercase font-bold tracking-wider"
                  />
                  <Button variant="outline" size="icon" onClick={generateRandomCode} title="Generar Aleatorio">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* MONTO Y LÍMITE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Descuento (Bs)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">Bs</span>
                    <Input 
                      type="number" 
                      className="pl-9 font-semibold" 
                      placeholder="50.00"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({...formData, discount_amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Límite de Usos</Label>
                  <Input 
                    type="number" 
                    placeholder="100"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                  />
                </div>
              </div>

              {/* FECHA Y ESTADO */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="grid gap-2">
                  <Label>Expiración</Label>
                  <Input 
                    type="date" 
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-lg border">
                  <Label className="text-xs text-slate-500">Estado Inicial</Label>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                    />
                    <span className={`text-sm font-medium ${formData.active ? "text-green-600" : "text-slate-400"}`}>
                      {formData.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} className="w-full sm:w-auto">
                {isEditing ? "Actualizar Cupón" : "Guardar Cupón"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLA DE CUPONES */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">Cargando datos...</div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <TicketPercent className="w-12 h-12 text-slate-300 mb-4"/>
            <p className="text-lg font-medium text-slate-700">No hay cupones</p>
            <p className="text-sm text-slate-500">Crea el primero para empezar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Código</th>
                  <th className="px-6 py-4 font-semibold">Descuento</th>
                  <th className="px-6 py-4 font-semibold w-1/3">Progreso de Uso</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon)
                  const limit = coupon.usage_limit || 1 
                  const usagePercent = Math.min((coupon.used_count / limit) * 100, 100)
                  
                  return (
                    <tr key={coupon.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                      {/* Código y Fecha */}
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900 text-base tracking-wide bg-slate-100 inline-block px-2 py-1 rounded">
                          {coupon.code}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3"/>
                          {formatDate(coupon.expiration_date)}
                        </div>
                      </td>

                      {/* Monto */}
                      <td className="px-6 py-4">
                        <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full font-bold text-sm border border-green-100">
                          - Bs {coupon.discount_amount}
                        </span>
                      </td>

                      {/* Barra de Progreso */}
                      <td className="px-6 py-4">
                        <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-600">
                          <span>{coupon.used_count} canjeados</span>
                          <span>de {coupon.usage_limit}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              usagePercent >= 100 ? 'bg-red-500' : 
                              usagePercent > 75 ? 'bg-orange-500' : 'bg-blue-600'
                            }`} 
                            style={{ width: `${usagePercent}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>

                      {/* Botones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenEdit(coupon)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}