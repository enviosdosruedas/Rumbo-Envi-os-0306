// src/app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirigir inmediatamente al panel principal del dashboard
  redirect("/panel");
}
