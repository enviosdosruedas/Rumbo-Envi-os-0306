import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Properly handle session with error catching
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Error fetching session:", sessionError.message)
    redirect("/login")
  }

  if (!sessionData?.session) {
    redirect("/login")
  }

  // Safely get user data
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    console.error("Error fetching user:", userError?.message)
    redirect("/login")
  }

  const user = userData.user

  // Safely get repartidor data with error handling
  const { data: repartidor, error: repartidorError } = await supabase
    .from("repartidores")
    .select("*")
    .eq("user_auth_id", user.id)
    .single()

  if (repartidorError && repartidorError.code !== "PGRST116") {
    console.error("Error fetching repartidor:", repartidorError.message)
  }

  // Fetch company configuration for pickup defaults if repartidor exists
  let configuracionEmpresa = null
  if (repartidor?.empresa_id) {
    const { data: configData } = await supabase
      .from("configuracion_empresa")
      .select("*")
      .eq("id", repartidor.empresa_id)
      .single()

    configuracionEmpresa = configData
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar repartidor={repartidor} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} repartidor={repartidor} />
        <main className="flex-1 overflow-y-auto p-6">
          <div data-empresa-config={configuracionEmpresa ? JSON.stringify(configuracionEmpresa) : "{}"}>{children}</div>
        </main>
      </div>
    </div>
  )
}
