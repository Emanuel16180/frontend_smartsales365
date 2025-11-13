"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useProviders } from "@/hooks/use-providers"
import ProvidersService, { type Provider } from "@/lib/providers-service"
import { ChevronLeft, ChevronRight, Edit2 } from "lucide-react"

export default function ProvidersPage() {
  const { providers, isLoading, error, refetch, currentPage, hasNextPage, hasPreviousPage, goToPage, totalCount } =
    useProviders()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProvider, setEditingProvider] = useState<number | null>(null)

  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.contact_email.trim() || !formData.contact_phone.trim()) {
      toast({ description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await ProvidersService.createProvider({
        name: formData.name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
      })
      toast({ description: "Proveedor creado exitosamente" })
      setFormData({ name: "", contact_email: "", contact_phone: "" })
      setIsOpen(false)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (provider: Provider) => {
    setEditingProvider(provider.id)
    setFormData({
      name: provider.name,
      contact_email: provider.contact_email,
      contact_phone: provider.contact_phone,
    })
    setIsEditOpen(true)
  }

  const handleUpdateProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.contact_email.trim() || !formData.contact_phone.trim() || !editingProvider) {
      toast({ description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await ProvidersService.updateProvider(editingProvider, {
        name: formData.name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
      })
      toast({ description: "Proveedor actualizado exitosamente" })
      setFormData({ name: "", contact_email: "", contact_phone: "" })
      setIsEditOpen(false)
      setEditingProvider(null)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor?")) return

    try {
      await ProvidersService.deleteProvider(id)
      toast({ description: "Proveedor eliminado" })
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-600 mt-1">Tienes {totalCount} proveedores registrados</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Crear Proveedor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Proveedor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProvider} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  placeholder="Nombre del proveedor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email de Contacto</label>
                <Input
                  type="email"
                  placeholder="contact@provider.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono de Contacto</label>
                <Input
                  placeholder="Teléfono"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  required
                />
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
          <p className="text-center text-slate-600">Cargando proveedores...</p>
        </Card>
      ) : providers.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No hay proveedores registrados</p>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Teléfono</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium">{provider.name}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{provider.contact_email}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{provider.contact_phone}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(provider)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(provider.id)}>
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
            <DialogTitle>Editar Proveedor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProvider} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                placeholder="Nombre del proveedor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email de Contacto</label>
              <Input
                type="email"
                placeholder="contact@provider.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono de Contacto</label>
              <Input
                placeholder="Teléfono"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                required
              />
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
                  setEditingProvider(null)
                  setFormData({ name: "", contact_email: "", contact_phone: "" })
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
