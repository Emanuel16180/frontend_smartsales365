"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("✅ Service Worker registrado:", reg.scope))
        .catch((err) => console.log("❌ Error al registrar SW:", err))
    }
  }, [])

  return null
}