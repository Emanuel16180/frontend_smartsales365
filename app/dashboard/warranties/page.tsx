"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useWarranties } from "@/hooks/use-warranties"
import WarrantiesService, { type Warranty } from "@/lib/warranties-service"
import ProvidersService, { type Provider } from "@/lib/providers-service"
import { ChevronLeft, ChevronRight, Edit2 } from "lucide-react"
import { useEffect } from "react"

export default function WarrantiesPage() {
  const { warranties, isLoading, error, refetch, currentPage, hasNextPage, hasPreviousPage, goToPage, totalCount } =
    useWarranties()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [formData, setFormData] = useState({
    title: "",
    terms: "",
    duration_days: "",
    provider_id: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingWarranty, setEditingWarranty] = useState<number | null>(null)

  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await ProvidersService.getProviders()
        setProviders(data.results) // extract results array from ProvidersResponse object
      } catch (err) {
        console.error("Error fetching providers:", err)
      }
    }
    fetchProviders()
  }, [])

  const handleCreateWarranty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.terms.trim() || !formData.duration_days || !formData.provider_id) {
      toast({ description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await WarrantiesService.createWarranty({
        title: formData.title,
        terms: formData.terms,
        duration_days: Number.parseInt(formData.duration_days),
        provider_id: Number.parseInt(formData.provider_id),
      })
      toast({ description: "Garantía creada exitosamente" })
      setFormData({ title: "", terms: "", duration_days: "", provider_id: "" })
      setIsOpen(false)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (warranty: Warranty) => {
    setEditingWarranty(warranty.id)
    setFormData({
      title: warranty.title,
      terms: warranty.terms,
      duration_days: String(warranty.duration_days),
      provider_id: String(warranty.provider.id),
    })
    setIsEditOpen(true)
  }

  const handleUpdateWarranty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.title.trim() ||
      !formData.terms.trim() ||
      !formData.duration_days ||
      !formData.provider_id ||
      !editingWarranty
    ) {
      toast({ description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await WarrantiesService.updateWarranty(editingWarranty, {
        title: formData.title,
        terms: formData.terms,
        duration_days: Number.parseInt(formData.duration_days),
        provider: { id: Number.parseInt(formData.provider_id) } as any,
      })
      toast({ description: "Garantía actualizada exitosamente" })
      setFormData({ title: "", terms: "", duration_days: "", provider_id: "" })
      setIsEditOpen(false)
      setEditingWarranty(null)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta garantía?")) return

    try {
      await WarrantiesService.deleteWarranty(id)
      toast({ description: "Garantía eliminada" })
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Garantías</h1>
          <p className="text-slate-600 mt-1">Tienes {totalCount} plantillas de garantía</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Crear Garantía</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Plantilla de Garantía</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWarranty} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Ej: Garantía Premium, Garantía Estándar"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Términos y Condiciones</label>
                <textarea
                  placeholder="Describe los términos de la garantía"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  rows={3}
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duración (días)</label>
                <Input
                  type="number"
                  placeholder="365"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Proveedor</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={formData.provider_id}
                  onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                  required
                >
                  <option value="">Seleccionar proveedor...</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800">
                {isSubmitting ? "Creando..." : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6">
          <p className="text-center text-slate-600">Cargando garantías...</p>
        </Card>
      ) : warranties.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No hay garantías registradas</p>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Título</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Términos</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Duración</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Proveedor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Teléfono</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {warranties.map((warranty) => (
                    <tr key={warranty.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium">{warranty.title}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 max-w-xs truncate">{warranty.terms}</td>
                      <td className="px-6 py-3">{warranty.duration_days} días</td>
                      <td className="px-6 py-3 text-sm font-medium">{warranty.provider.name}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{warranty.provider.contact_email}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{warranty.provider.contact_phone}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(warranty)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(warranty.id)}>
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => goToPage(currentPage - 1)}
                disabled={!hasPreviousPage || isLoading}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasNextPage || isLoading}
                variant="outline"
                size="sm"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Garantía</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateWarranty} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Ej: Garantía Premium, Garantía Estándar"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Términos y Condiciones</label>
              <textarea
                placeholder="Describe los términos de la garantía"
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duración (días)</label>
              <Input
                type="number"
                placeholder="365"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Proveedor</label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={formData.provider_id}
                onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                required
              >
                <option value="">Seleccionar proveedor...</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-slate-900 hover:bg-slate-800">
                {isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false)
                  setEditingWarranty(null)
                  setFormData({ title: "", terms: "", duration_days: "", provider_id: "" })
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
