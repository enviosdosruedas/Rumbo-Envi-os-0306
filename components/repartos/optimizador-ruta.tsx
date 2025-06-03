"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

interface Reparto {
  id: number
  fecha: string
  // ... other properties
}

interface Ubicacion {
  id: number
  direccion: string
  latitud: number
  longitud: number
  // ... other properties
}

const OptimizadorRuta = () => {
  const [repartos, setRepartos] = useState<Reparto[]>([])
  const [repartoSeleccionado, setRepartoSeleccionado] = useState<Reparto | null>(null)
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [rutaOptimizada, setRutaOptimizada] = useState<Ubicacion[] | null>(null)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch repartos and ubicaciones from Supabase (example)
  useEffect(() => {
    const fetchData = async () => {
      setCargando(true)
      try {
        const supabase = createClient()

        // Example: Fetch repartos
        // const { data: repartosData, error: repartosError } = await supabase
        //   .from('repartos')
        //   .select('*');

        // if (repartosError) {
        //   throw repartosError;
        // }

        // setRepartos(repartosData || []);

        // Example: Fetch ubicaciones
        // const { data: ubicacionesData, error: ubicacionesError } = await supabase
        //   .from('ubicaciones')
        //   .select('*');

        // if (ubicacionesError) {
        //   throw ubicacionesError;
        // }

        // setUbicaciones(ubicacionesData || []);

        // Dummy data for testing
        setRepartos([{ id: 1, fecha: "2024-01-01" }])
        setUbicaciones([
          { id: 1, direccion: "Dir 1", latitud: 1.0, longitud: 1.0 },
          { id: 2, direccion: "Dir 2", latitud: 2.0, longitud: 2.0 },
        ])
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError("Error al cargar los datos")
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  const handleRepartoSeleccionado = (reparto: Reparto) => {
    setRepartoSeleccionado(reparto)
    // Filter ubicaciones based on reparto if needed
  }

  const handleOptimizarRuta = async () => {
    if (!ubicaciones) return

    setCargando(true)
    try {
      // Placeholder for route optimization logic (e.g., using an API)
      // In a real application, you would use a service like Google Maps Distance Matrix API
      // or a dedicated route optimization library.

      // For now, just reverse the order of locations as a simple example
      const rutaInvertida = [...ubicaciones].reverse()
      setRutaOptimizada(rutaInvertida)
    } catch (error) {
      console.error("Error optimizando la ruta:", error)
      setError("Error al optimizar la ruta")
    } finally {
      setCargando(false)
    }
  }

  const handleGuardarRutaOptimizada = async () => {
    if (!rutaOptimizada || !repartoSeleccionado) return

    setGuardando(true)
    try {
      const supabase = createClient()

      // Example: Save the optimized route to the database
      // const { data, error } = await supabase
      //   .from('rutas_optimizadas')
      //   .insert([
      //     {
      //       reparto_id: repartoSeleccionado.id,
      //       ruta: JSON.stringify(rutaOptimizada.map(u => u.id)), // Store location IDs
      //     },
      //   ]);

      // if (error) {
      //   throw error;
      // }

      // console.log("Ruta optimizada guardada:", data);

      // Dummy success message
      console.log("Ruta optimizada guardada")
    } catch (error) {
      console.error("Error guardando ruta optimizada:", error)
      setError("Error al guardar la ruta optimizada")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <h1>Optimizador de Ruta</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div>
        <h2>Seleccionar Reparto</h2>
        {repartos.map((reparto) => (
          <button key={reparto.id} onClick={() => handleRepartoSeleccionado(reparto)}>
            Reparto {reparto.fecha}
          </button>
        ))}
      </div>

      {repartoSeleccionado && (
        <div>
          <h2>Ruta Optimizada</h2>
          <button onClick={handleOptimizarRuta} disabled={cargando}>
            Optimizar Ruta
          </button>

          {rutaOptimizada && (
            <div>
              <h3>Orden de Visita:</h3>
              <ol>
                {rutaOptimizada.map((ubicacion) => (
                  <li key={ubicacion.id}>{ubicacion.direccion}</li>
                ))}
              </ol>
              <button onClick={handleGuardarRutaOptimizada} disabled={guardando}>
                Guardar Ruta Optimizada
              </button>
            </div>
          )}
        </div>
      )}

      {cargando && <div>Cargando...</div>}
      {guardando && <div>Guardando...</div>}
    </div>
  )
}

export default OptimizadorRuta
