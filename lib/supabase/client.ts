import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  // Verificar que estamos en el navegador
  if (typeof window === "undefined") {
    throw new Error("createClient debe ser llamado solo en el cliente")
  }

  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Variables de entorno de Supabase no disponibles")
      throw new Error("Configuración de Supabase incompleta")
    }

    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return client
}
