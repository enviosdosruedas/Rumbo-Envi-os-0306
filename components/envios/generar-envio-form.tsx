"use client"

import { useState } from "react"
import { BusquedaCliente } from "./busqueda-cliente"
import { RegistroCliente } from "./registro-cliente"
import { FormularioEnvio } from "./formulario-envio"
import type { Cliente } from "@/types"

interface GenerarEnvioFormProps {
  repartidorId: string
}

type Step = "busqueda" | "registro" | "envio"

export function GenerarEnvioForm({ repartidorId }: GenerarEnvioFormProps) {
  const [step, setStep] = useState<Step>("busqueda")
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [telefono, setTelefono] = useState("")

  const handleClienteEncontrado = (clienteData: Cliente) => {
    setCliente(clienteData)
    setStep("envio")
  }

  const handleClienteNoEncontrado = (tel: string) => {
    setTelefono(tel)
    setStep("registro")
  }

  const handleClienteRegistrado = (clienteData: Cliente) => {
    setCliente(clienteData)
    setStep("envio")
  }

  const handleVolver = () => {
    setStep("busqueda")
    setCliente(null)
    setTelefono("")
  }

  return (
    <div className="max-w-4xl mx-auto">
      {step === "busqueda" && (
        <BusquedaCliente
          onClienteEncontrado={handleClienteEncontrado}
          onClienteNoEncontrado={handleClienteNoEncontrado}
        />
      )}

      {step === "registro" && (
        <RegistroCliente telefono={telefono} onClienteRegistrado={handleClienteRegistrado} onVolver={handleVolver} />
      )}

      {step === "envio" && cliente && (
        <FormularioEnvio cliente={cliente} repartidorId={repartidorId} onVolver={handleVolver} />
      )}
    </div>
  )
}
