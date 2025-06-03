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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Obtener datos del repartidor
  const { data: repartidor } = await supabase.from("repartidores").select("*").eq("user_auth_id", user.id).single()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar repartidor={repartidor} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} repartidor={repartidor} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
