import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rumbo Envíos - Sistema de Gestión de Repartos",
  description: "Sistema completo de gestión de repartos y entregas para repartidores",
  keywords: ["repartos", "entregas", "logística", "gestión", "rutas"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
