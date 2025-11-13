"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useProducts } from "@/hooks/use-products"
import { useAllBrands } from "@/hooks/use-all-brands"
import { useAllCategories } from "@/hooks/use-all-categories"
import { useAllWarranties } from "@/hooks/use-all-warranties"
import ProductsService from "@/lib/products-service"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react" // <- Importar Trash2

export default function ProductsPage() {
  const { products, isLoading, error, refetch, currentPage, hasNextPage, hasPreviousPage, goToPage, totalCount } =
    useProducts()
  const { brands } = useAllBrands()
  const { categories, flatCategories } = useAllCategories()
  const { warranties } = useAllWarranties()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    brand_id: "",
    category_id: "",
    warranty_id: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const itemsPerPage = 25
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handleEditClick = (product: any) => {
    setEditingProduct(product.id)
    setFormData({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description || "",
      brand_id: String(product.brand?.id || ""),
      category_id: String(product.category?.id || ""),
      warranty_id: String(product.warranty?.id || ""),
    })
    setImageFile(null)
    setIsEditOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.brand_id) {
      toast({ description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const productData = {
        name: formData.name,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        brand_id: Number.parseInt(formData.brand_id),
        category_id: formData.category_id ? Number.parseInt(formData.category_id) : undefined,
        warranty_id: formData.warranty_id ? Number.parseInt(formData.warranty_id) : undefined,
        description: formData.description || undefined,
        image_upload: imageFile || undefined,
      }

      if (editingProduct) {
        await ProductsService.updateProduct(editingProduct, productData)
        toast({ description: "Producto actualizado exitosamente" })
        setIsEditOpen(false)
        setEditingProduct(null)
      } else {
        await ProductsService.createProduct(productData)
        toast({ description: "Producto creado exitosamente" })
        setIsOpen(false)
      }

      setFormData({ name: "", price: "", stock: "", description: "", brand_id: "", category_id: "", warranty_id: "" })
      setImageFile(null)
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return

    try {
      await ProductsService.deleteProduct(id)
      toast({ description: "Producto eliminado" })
      await refetch()
    } catch (err) {
      toast({ description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`, variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", price: "", stock: "", description: "", brand_id: "", category_id: "", warranty_id: "" })
    setImageFile(null)
    setEditingProduct(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-600 mt-1">
            Tienes {totalCount} productos en total ({products.length} en esta página)
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Agregar Producto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre del Producto</label>
                <Input
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Precio</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Marca</label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  required
                >
                  <option value="">Selecciona una marca</option>
                  {(brands || []).map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Categoría</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Selecciona una categoría (opcional)</option>
                  {(flatCategories || []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Garantía</label>
                <select
                  value={formData.warranty_id}
                  onChange={(e) => setFormData({ ...formData, warranty_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Selecciona una garantía (opcional)</option>
                  {(warranties || []).map((warranty) => (
                    <option key={warranty.id} value={warranty.id}>
                      {warranty.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  placeholder="Descripción del producto"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Creando..." : "Crear Producto"}
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
          <p className="text-center text-slate-600">Cargando productos...</p>
        </Card>
      ) : products.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No hay productos registrados</p>
            <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Crear Primer Producto
            </Button>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold">Imagen</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Marca</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Precio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Categoría</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Garantía</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium">{product.name}</td>
                      <td className="px-6 py-3">
                        {product.image_url ? (
                          <div className="relative w-12 h-12">
                            <Image
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500">
                            Sin img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">{product.brand?.name || "-"}</td>
                      <td className="px-6 py-3">
                        {/* --- CORRECCIÓN AQUÍ --- */}
                        BOB{" "}
                        {typeof product.price === "number"
                          ? product.price.toFixed(2)
                          : Number.parseFloat(String(product.price)).toFixed(2)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.stock > 10 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">{product.category?.name || "-"}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{product.warranty?.title || "-"}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => handleEditClick(product)}
                            className="text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(product.id)}
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
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre del Producto</label>
              <Input
                placeholder="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Precio</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Marca</label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
                required
              >
                <option value="">Selecciona una marca</option>
                {(brands || []).map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Selecciona una categoría (opcional)</option>
                {(flatCategories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Garantía</label>
              <select
                value={formData.warranty_id}
                onChange={(e) => setFormData({ ...formData, warranty_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Selecciona una garantía (opcional)</option>
                {(warranties || []).map((warranty) => (
                  <option key={warranty.id} value={warranty.id}>
                    {warranty.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                placeholder="Descripción del producto"
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Imagen (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Actualizando..." : "Actualizar Producto"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsEditOpen(false)
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