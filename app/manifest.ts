import type { MetadataRoute } from "next";

// Permite instalar la app en la pantalla de inicio del teléfono (ícono: escudo del club)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Club Tribu Austral",
    short_name: "Tribu Austral",
    description: "Tareas, eventos y cargos del club",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1f5fa8",
    lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
