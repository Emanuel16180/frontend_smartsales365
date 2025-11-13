import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // --- CAMPOS ACTUALIZADOS ---
  title: "SmartSales365 Admin",
  description: "Panel de Administración para SmartSales365",
  
  // --- INICIO DE CAMBIOS PWA ---
  manifest: "/manifest.json",
  themeColor: "#3b82f6", // Color azul de la app
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartSales365 Admin",
  },
  // --- FIN DE CAMBIOS PWA ---

  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}