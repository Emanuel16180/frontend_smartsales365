"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const navigationItems = [
  { href: "/dashboard", label: "Panel Principal", icon: "📊" },
  {
    label: "Administración",
    icon: "⚙️",
    submenu: [
      { href: "/dashboard/products", label: "Productos", icon: "📦" },
      { href: "/dashboard/categories", label: "Categorías", icon: "🏷️" },
      { href: "/dashboard/brands", label: "Marcas", icon: "🏢" },
      { href: "/dashboard/providers", label: "Proveedores", icon: "🚚" },
      { href: "/dashboard/warranties", label: "Garantías", icon: "✓" },
    ],
  },
  { href: "/dashboard/sales", label: "Ventas", icon: "🛒" },
  { href: "/dashboard/customers", label: "Clientes", icon: "👥" },
  { href: "/dashboard/settings", label: "Configuración", icon: "⚙️" },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [expandedMenu, setExpandedMenu] = useState<string | null>("Administración")

  const isSubmenuActive = (submenu: (typeof navigationItems)[0]["submenu"]) => {
    return submenu?.some((item) => pathname === item.href)
  }

  return (
    <nav className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold">SmartSalas365</h1>
        <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
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
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      hasActiveChild || isOpen ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800",
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {/* Submenu items */}
                  {isOpen && (
                    <div className="ml-4 mt-2 space-y-1 border-l border-slate-700 pl-3">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                            pathname === subitem.href
                              ? "bg-slate-600 text-white font-medium"
                              : "text-slate-400 hover:text-white hover:bg-slate-800",
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
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  pathname === item.href ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800",
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-400 text-center">© 2025 SmartSalas365</p>
      </div>
    </nav>
  )
}
