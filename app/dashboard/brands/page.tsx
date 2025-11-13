"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useBrands } from "@/hooks/use-brands"
import BrandsService from "@/lib/brands-service"
import { ChevronLeft, ChevronRight, Edit2 } from "lucide-react"

export default function BrandsPage() {
  const { brands, isLoading, error, refetch, currentPage, hasNextPage, hasPreviousPage, goToPage, totalCount } =
    useBrands()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingBrand, setEditingBrand] = useState<number | null>(null)

  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({ description: "El nombre es requerido", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await BrandsService.createBrand({
        name: formData.name,
      })
      toast({ description: "Marca creada exitosamente" })
      setFormData({ name: "" })
      setIsOpen(false)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (brand: any) => {
    setEditingBrand(brand.id)
    setFormData({
      name: brand.name,
    })
    setIsEditOpen(true)
  }

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !editingBrand) {
      toast({ description: "El nombre es requerido", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await BrandsService.updateBrand(editingBrand, {
        name: formData.name,
      })
      toast({ description: "Marca actualizada exitosamente" })
      setFormData({ name: "" })
      setIsEditOpen(false)
      setEditingBrand(null)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta marca?")) return

    try {
      await BrandsService.deleteBrand(id)
      toast({ description: "Marca eliminada" })
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Marcas</h1>
          <p className="text-slate-600 mt-1">Tienes {totalCount} marcas registradas</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Crear Marca</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Marca</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  placeholder="Nombre de la marca"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <p className="text-center text-slate-600">Cargando marcas...</p>
        </Card>
      ) : brands.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No hay marcas registradas</p>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium">{brand.name}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(brand)} className="gap-1">
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(brand.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Marca</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBrand} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                placeholder="Nombre de la marca"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  setEditingBrand(null)
                  setFormData({ name: "" })
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
