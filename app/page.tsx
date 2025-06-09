import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirigir inmediatamente a la página de login
  // en lugar de la página de bienvenida para evitar problemas de autenticación
  redirect("/panel")
}
