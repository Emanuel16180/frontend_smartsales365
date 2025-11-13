"use client"

import type { ReactNode } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarNav } from "@/components/sidebar-nav"
import { TopBar } from "@/components/top-bar"

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <SidebarNav />
        <div className="flex-1 ml-64">
          <TopBar />
          <main className="mt-16 p-6 bg-slate-50 min-h-[calc(100vh-64px)]">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
