"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

// --- ESTRUCTURA DE NAVEGACIÓN REORDENADA ---
const navigationItems = [
  // 1. Dashboard
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  
  // 2. Clientes
  { href: "/dashboard/customers", label: "Clientes", icon: "👥" },
  
  // 3. Operaciones
  {
    label: "Operaciones",
    icon: "📈",
    submenu: [
      { href: "/dashboard/sales", label: "Ventas", icon: "🛒" },
      { href: "/dashboard/reports", label: "Reportes", icon: "📄" },
    ],
  },
  
  // 4. Catálogo (con submenú reordenado)
  {
    label: "Catálogo",
    icon: "📚",
    submenu: [
      { href: "/dashboard/products", label: "Productos", icon: "📦" },
      { href: "/dashboard/brands", label: "Marcas", icon: "🏢" },
      { href: "/dashboard/categories", label: "Categorías", icon: "🏷️" },
      { href: "/dashboard/warranties", label: "Garantías", icon: "✓" },
      { href: "/dashboard/providers", label: "Proveedores", icon: "🚚" },
    ],
  },
  
  // 5. Configuración
  { href: "/dashboard/settings", label: "Configuración", icon: "⚙️" },
]
// --- FIN DE LA ACTUALIZACIÓN ---

export function SidebarNav() {
  const pathname = usePathname()
  
  const isSubmenuActive = (submenu: (typeof navigationItems)[0]["submenu"]) => {
    return submenu?.some((item) => pathname === item.href)
  }

  // Detecta el grupo de submenú activo para mantenerlo abierto por defecto
  const getActiveSubmenu = () => {
    const activeItem = navigationItems.find(item => 
      "submenu" in item && item.submenu && isSubmenuActive(item.submenu)
    )
    // Si un hijo está activo, abre su padre. Si no, abre "Catálogo" por defecto.
    return activeItem ? activeItem.label : "Catálogo"
  }

  const [expandedMenu, setExpandedMenu] = useState<string | null>(getActiveSubmenu())

  return (
    <nav className="w-64 bg-white text-slate-900 h-screen flex flex-col fixed left-0 top-0 border-r border-slate-200">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">SmartSales365</h1>
        <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            if ("submenu" in item && item.submenu) {
              const isOpen = expandedMenu === item.label
              const hasActiveChild = isSubmenuActive(item.submenu)

              return (
                <div key={item.label}>
                  <button
                    onClick={() => setExpandedMenu(isOpen ? null : item.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm",
                      hasActiveChild
                        ? "bg-blue-50 text-blue-700 font-medium" // Estilo si un hijo está activo
                        : isOpen
                          ? "bg-slate-100 text-slate-900" // Estilo si está abierto pero sin hijo activo
                          : "text-slate-600 hover:bg-slate-100" // Estilo por defecto
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {/* Submenu items */}
                  {isOpen && (
                    <div className="ml-4 mt-2 space-y-1 border-l border-slate-300 pl-3">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                            pathname === subitem.href
                              ? "bg-blue-50 text-blue-700 font-medium" // Estilo activo para sub-item
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100" // Estilo por defecto para sub-item
                          )}
                        >
                          <span>{subitem.icon}</span>
                          <span>{subitem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 font-medium" // Estilo activo
                    : "text-slate-600 hover:bg-slate-100" // Estilo por defecto
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">© 2025 SmartSales365</p>
      </div>
    </nav>
  )
}