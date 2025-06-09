// app/(dashboard)/layout.tsx (Modificado para funcionar sin login)
import type React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
// Ya no se importan createClient ni redirect porque no se necesitan aquí.

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Paso 1: Crear un objeto de usuario simulado (mock).
  // Usamos el email "a@a.com" como solicitaste.
  const mockUser = {
    id: "user-mock-12345", // ID de ejemplo, puedes poner lo que quieras
    email: "a@a.com",
    // Agrega otras propiedades del objeto User de Supabase si fueran necesarias
  };

  // Paso 2: Crear un objeto de repartidor simulado para que los componentes tengan datos.
  const mockRepartidor = {
    id: "repartidor-mock-67890", // ID de ejemplo
    user_auth_id: mockUser.id,
    nombre: "Usuario",
    apellido: "Demo",
    telefono: "+54 9 11 1234-5678",
    vehiculo: "Móvil de Prueba",
    matricula: "TEST 123",
    activo: true,
    empresa_id: null,
    email: mockUser.email,
    licencia_conducir: "12345678",
    fecha_ingreso: new Date().toISOString(),
    salario_base: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // El objeto de configuración de empresa ahora también es simulado o se deja como null.
  const configuracionEmpresa = null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Pasamos los datos simulados a los componentes */}
      <Sidebar repartidor={mockRepartidor} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={mockUser as any} repartidor={mockRepartidor} />
        <main className="flex-1 overflow-y-auto p-6">
          <div data-empresa-config={configuracionEmpresa ? JSON.stringify(configuracionEmpresa) : "{}"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
