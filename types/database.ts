export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nombre: string
          direccion: string | null
          telefono: string | null
          email: string | null
          latitud_empresa: number | null
          longitud_empresa: number | null
          activa: boolean | null
          codigo_empresa: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          latitud_empresa?: number | null
          longitud_empresa?: number | null
          activa?: boolean | null
          codigo_empresa?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          latitud_empresa?: number | null
          longitud_empresa?: number | null
          activa?: boolean | null
          codigo_empresa?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nombre: string
          apellido: string | null
          telefono: string | null
          email: string | null
          direccion: string | null
          latitud: number | null
          longitud: number | null
          empresa_id: string | null
          activo: boolean | null
          codigo_cliente: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          apellido?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          latitud?: number | null
          longitud?: number | null
          empresa_id?: string | null
          activo?: boolean | null
          codigo_cliente?: string | null
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          apellido?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          latitud?: number | null
          longitud?: number | null
          empresa_id?: string | null
          activo?: boolean | null
          codigo_cliente?: string | null
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      repartidores: {
        Row: {
          id: string
          user_auth_id: string
          nombre: string
          apellido: string
          telefono: string | null
          vehiculo: string | null
          matricula: string | null
          activo: boolean
          empresa_id: string | null
          email: string | null
          licencia_conducir: string | null
          fecha_ingreso: string | null
          salario_base: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_auth_id: string
          nombre: string
          apellido: string
          telefono?: string | null
          vehiculo?: string | null
          matricula?: string | null
          activo?: boolean
          empresa_id?: string | null
          email?: string | null
          licencia_conducir?: string | null
          fecha_ingreso?: string | null
          salario_base?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_auth_id?: string
          nombre?: string
          apellido?: string
          telefono?: string | null
          vehiculo?: string | null
          matricula?: string | null
          activo?: boolean
          empresa_id?: string | null
          email?: string | null
          licencia_conducir?: string | null
          fecha_ingreso?: string | null
          salario_base?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      repartos: {
        Row: {
          id: string
          repartidor_id: string
          fecha: string
          estado: "pendiente" | "en_progreso" | "completado" | "cancelado"
          notas: string | null
          hora_inicio: string | null
          hora_fin: string | null
          kilometros_recorridos: number | null
          combustible_usado: number | null
          costo_total: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          repartidor_id: string
          fecha?: string
          estado?: "pendiente" | "en_progreso" | "completado" | "cancelado"
          notas?: string | null
          hora_inicio?: string | null
          hora_fin?: string | null
          kilometros_recorridos?: number | null
          combustible_usado?: number | null
          costo_total?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          repartidor_id?: string
          fecha?: string
          estado?: "pendiente" | "en_progreso" | "completado" | "cancelado"
          notas?: string | null
          hora_inicio?: string | null
          hora_fin?: string | null
          kilometros_recorridos?: number | null
          combustible_usado?: number | null
          costo_total?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      envios: {
        Row: {
          id: string
          numero_seguimiento: string
          cliente_id: string
          repartidor_id: string | null
          reparto_id: string | null
          direccion_origen: string
          latitud_origen: number
          longitud_origen: number
          direccion_destino: string
          latitud_destino: number
          longitud_destino: number
          estado: "pendiente" | "asignado" | "en_transito" | "entregado" | "fallido" | "cancelado"
          descripcion: string | null
          peso: number | null
          peso_kg: number | null
          valor_declarado: number | null
          precio: number | null
          fecha_estimada: string | null
          fecha_entrega: string | null
          notas_entrega: string | null
          orden_parada: number | null
          tipo_envio: "origen" | "entrega" | "recogida" | null
          es_parada_origen: boolean | null
          distancia_km: number | null
          tiempo_estimado_minutos: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_seguimiento?: string
          cliente_id: string
          repartidor_id?: string | null
          reparto_id?: string | null
          direccion_origen?: string
          latitud_origen: number
          longitud_origen: number
          direccion_destino: string
          latitud_destino: number
          longitud_destino: number
          estado?: "pendiente" | "asignado" | "en_transito" | "entregado" | "fallido" | "cancelado"
          descripcion?: string | null
          peso?: number | null
          peso_kg?: number | null
          valor_declarado?: number | null
          precio?: number | null
          fecha_estimada?: string | null
          fecha_entrega?: string | null
          notas_entrega?: string | null
          orden_parada?: number | null
          tipo_envio?: "origen" | "entrega" | "recogida" | null
          es_parada_origen?: boolean | null
          distancia_km?: number | null
          tiempo_estimado_minutos?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_seguimiento?: string
          cliente_id?: string
          repartidor_id?: string | null
          reparto_id?: string | null
          direccion_origen?: string
          latitud_origen?: number
          longitud_origen?: number
          direccion_destino?: string
          latitud_destino?: number
          longitud_destino?: number
          estado?: "pendiente" | "asignado" | "en_transito" | "entregado" | "fallido" | "cancelado"
          descripcion?: string | null
          peso?: number | null
          peso_kg?: number | null
          valor_declarado?: number | null
          precio?: number | null
          fecha_estimada?: string | null
          fecha_entrega?: string | null
          notas_entrega?: string | null
          orden_parada?: number | null
          tipo_envio?: "origen" | "entrega" | "recogida" | null
          es_parada_origen?: boolean | null
          distancia_km?: number | null
          tiempo_estimado_minutos?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      paradas_reparto: {
        Row: {
          id: string
          reparto_id: string
          envio_id: string
          orden: number
          completada: boolean
          hora_llegada: string | null
          hora_salida: string | null
          hora_real_llegada: string | null
          hora_real_salida: string | null
          notas_parada: string | null
          estado: string | null
          firma_cliente: string | null
          foto_entrega: string | null
          tiempo_permanencia_minutos: number | null
          hora_estimada_llegada: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reparto_id: string
          envio_id: string
          orden: number
          completada?: boolean
          hora_llegada?: string | null
          hora_salida?: string | null
          hora_real_llegada?: string | null
          hora_real_salida?: string | null
          notas_parada?: string | null
          estado?: string | null
          firma_cliente?: string | null
          foto_entrega?: string | null
          tiempo_permanencia_minutos?: number | null
          hora_estimada_llegada?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reparto_id?: string
          envio_id?: string
          orden?: number
          completada?: boolean
          hora_llegada?: string | null
          hora_salida?: string | null
          hora_real_llegada?: string | null
          hora_real_salida?: string | null
          notas_parada?: string | null
          estado?: string | null
          firma_cliente?: string | null
          foto_entrega?: string | null
          tiempo_permanencia_minutos?: number | null
          hora_estimada_llegada?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      configuracion_empresa: {
        Row: {
          id: string
          nombre_empresa: string
          ciudad: string
          provincia: string
          pais: string
          codigo_postal: string | null
          direccion_completa: string | null
          latitud: number
          longitud: number
          zona_horaria: string | null
          telefono_principal: string | null
          email_principal: string | null
          sitio_web: string | null
          es_configuracion_principal: boolean | null
          moneda: string | null
          idioma: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_empresa: string
          ciudad: string
          provincia: string
          pais: string
          codigo_postal?: string | null
          direccion_completa?: string | null
          latitud: number
          longitud: number
          zona_horaria?: string | null
          telefono_principal?: string | null
          email_principal?: string | null
          sitio_web?: string | null
          es_configuracion_principal?: boolean | null
          moneda?: string | null
          idioma?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_empresa?: string
          ciudad?: string
          provincia?: string
          pais?: string
          codigo_postal?: string | null
          direccion_completa?: string | null
          latitud?: number
          longitud?: number
          zona_horaria?: string | null
          telefono_principal?: string | null
          email_principal?: string | null
          sitio_web?: string | null
          es_configuracion_principal?: boolean | null
          moneda?: string | null
          idioma?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      configuracion_sistema: {
        Row: {
          id: string
          clave: string
          valor: string
          descripcion: string | null
          tipo: string | null
          categoria: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clave: string
          valor: string
          descripcion?: string | null
          tipo?: string | null
          categoria?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clave?: string
          valor?: string
          descripcion?: string | null
          tipo?: string | null
          categoria?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      estado_envio: "pendiente" | "asignado" | "en_transito" | "entregado" | "fallido" | "cancelado"
      estado_reparto: "pendiente" | "en_progreso" | "completado" | "cancelado"
      tipo_envio: "origen" | "entrega" | "recogida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
