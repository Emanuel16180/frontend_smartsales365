"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/hooks/use-categories"
import CategoriesService from "@/lib/categories-service"
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react" // <- Importar Trash2

export default function CategoriesPage() {
  const {
    categories,
    flatCategories,
    isLoading,
    error,
    refetch,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    totalCount,
  } = useCategories()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", parent: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCategory, setEditingCategory] = useState<number | null>(null)

  const itemsPerPage = 10
  const displayedCategories = flatCategories
  const totalDisplayCount = flatCategories.length
  const totalPages = Math.ceil(totalDisplayCount / itemsPerPage)

  const paginatedCategories = displayedCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({ description: "El nombre es requerido", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await CategoriesService.createCategory({
        name: formData.name,
        parent: formData.parent ? Number.parseInt(formData.parent) : undefined,
      })
      toast({ description: "Categoría creada exitosamente" })
      setFormData({ name: "", parent: "" })
      setIsOpen(false)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (category: any) => {
    setEditingCategory(category.id)
    setFormData({
      name: category.name,
      parent: category.parent ? String(category.parent) : "",
    })
    setIsEditOpen(true)
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !editingCategory) {
      toast({ description: "El nombre es requerido", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await CategoriesService.updateCategory(editingCategory, {
        name: formData.name,
        parent: formData.parent ? Number.parseInt(formData.parent) : null,
      } as any)
      toast({ description: "Categoría actualizada exitosamente" })
      setFormData({ name: "", parent: "" })
      setIsEditOpen(false)
      setEditingCategory(null)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return

    try {
      await CategoriesService.deleteCategory(id)
      toast({ description: "Categoría eliminada" })
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categorías</h1>
          <p className="text-slate-600 mt-1">Tienes {totalDisplayCount} categorías registradas</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            {/* --- BOTÓN MODIFICADO --- */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Crear Categoría</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Categoría</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  placeholder="Nombre de la categoría"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoría Padre (Opcional)</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* --- BOTÓN MODIFICADO --- */}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
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
          <p className="text-center text-slate-600">Cargando categorías...</p>
        </Card>
      ) : displayedCategories.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No hay categorías registradas</p>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <span className="inline-block">{category.displayName || category.name}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">
                        {category.parent ? "Subcategoría" : "Principal"}
                      </td>
                      {/* --- ACCIONES MODIFICADAS --- */}
                      <td className="px-6 py-3">
                        <div className="flex gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => handleEditClick(category)}
                            className="text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
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
                disabled={currentPage === 1 || isLoading}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
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
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                placeholder="Nombre de la categoría"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoría Padre (Opcional)</label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={formData.parent}
                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {/* --- BOTÓN MODIFICADO --- */}
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false)
                  setEditingCategory(null)
                  setFormData({ name: "", parent: "" })
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
