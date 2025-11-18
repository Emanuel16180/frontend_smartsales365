/** @type {import('next').NextConfig} */
import withPWAInit from "next-pwa";

const runtimeCaching = [
  {
    // 1. API ROUTES (Tus datos: productos, ventas, etc.)
    urlPattern: /\/api\/.*/i,
    // --- CAMBIO IMPORTANTE AQUÍ ---
    // Antes: 'NetworkFirst' (Si falla internet, usa caché... pero localhost no falla, da error 500)
    // Ahora: 'StaleWhileRevalidate' (Usa caché SIEMPRE primero, luego intenta actualizar)
    handler: 'StaleWhileRevalidate', 
    options: {
      cacheName: 'api-data-cache',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60, // 24 horas
      },
      cacheableResponse: {
        statuses: [0, 200], // Solo guarda si la respuesta fue exitosa (no guarda errores 500)
      },
    },
  },
  {
    // 2. IMÁGENES
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'images-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      },
    },
  },
  {
    // 3. RECURSOS ESTÁTICOS (JS, CSS)
    urlPattern: /\.(?:js|css|woff2?)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-resources',
    },
  },
  {
    // 4. NAVEGACIÓN (Páginas HTML)
    urlPattern: /^https?.*/,
    handler: 'NetworkFirst', // Para páginas HTML está bien NetworkFirst
    options: {
      cacheName: 'others',
      networkTimeoutSeconds: 10,
    },
  },
];

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching, 
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withPWA(nextConfig)