# Guía de Implementación: Panel del Repartidor
## Sistema de Gestión de Entregas y Rutas

Esta guía describe en detalle cómo implementar el panel completo del repartidor, incluyendo todas las funcionalidades, diseño visual, estructura de datos y componentes necesarios para replicar el sistema en otro proyecto.

---

## 📋 Tabla de Contenidos

1. [Visión General del Sistema](#visión-general-del-sistema)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Arquitectura de Rutas](#arquitectura-de-rutas)
4. [Componentes Visuales](#componentes-visuales)
5. [Funcionalidades Principales](#funcionalidades-principales)
6. [Diseño y Estilo Visual](#diseño-y-estilo-visual)
7. [Integración con APIs](#integración-con-apis)
8. [Flujo de Usuario](#flujo-de-usuario)

---

## 1. Visión General del Sistema

### Propósito
El panel del repartidor es una aplicación web completa diseñada para gestionar entregas, optimizar rutas y proporcionar visibilidad en tiempo real de las operaciones de reparto. Está optimizado para uso móvil y desktop.

### Características Principales
- **Dashboard con estadísticas en tiempo real**
- **Gestión de repartos y entregas**
- **Visualización de rutas en mapa interactivo**
- **Optimización automática de rutas**
- **Generación de envíos**
- **Perfil de usuario personalizado**

### Stack Tecnológico Recomendado
- **Frontend**: Next.js 15+ con App Router
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Base de Datos**: PostgreSQL (Supabase o similar)
- **Autenticación**: Supabase Auth
- **Mapas**: Google Maps API
- **Iconos**: Lucide React

---

## 2. Estructura de Base de Datos

### Tablas Principales

#### 2.1 Tabla `empresas`
Almacena información de las empresas/centros de distribución.

\`\`\`sql
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  latitud_empresa DOUBLE PRECISION,
  longitud_empresa DOUBLE PRECISION,
  activa BOOLEAN DEFAULT true,
  codigo_empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

**Campos clave**:
- `latitud_empresa` y `longitud_empresa`: Coordenadas del centro de distribución para calcular rutas
- `activa`: Permite desactivar empresas sin eliminarlas

#### 2.2 Tabla `repartidores`
Información de los repartidores/conductores.

\`\`\`sql
CREATE TABLE repartidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  vehiculo TEXT,
  matricula TEXT,
  activo BOOLEAN DEFAULT true,
  empresa_id UUID REFERENCES empresas(id),
  email TEXT,
  licencia_conducir TEXT,
  fecha_ingreso DATE,
  salario_base NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

**Campos clave**:
- `user_auth_id`: Vincula el repartidor con el usuario autenticado
- `vehiculo` y `matricula`: Información del vehículo asignado
- `activo`: Control de acceso al sistema

#### 2.3 Tabla `clientes`
Información de los destinatarios de las entregas.

\`\`\`sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  latitud NUMERIC,
  longitud NUMERIC,
  empresa_id UUID REFERENCES empresas(id),
  activo BOOLEAN DEFAULT true,
  codigo_cliente TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

**Campos clave**:
- `latitud` y `longitud`: Coordenadas precisas para el mapa y optimización de rutas
- `notas`: Instrucciones especiales de entrega

#### 2.4 Tabla `repartos`
Representa una jornada de reparto completa.

\`\`\`sql
CREATE TABLE repartos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repartidor_id UUID NOT NULL REFERENCES repartidores(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  hora_inicio TIMESTAMP WITH TIME ZONE,
  hora_fin TIMESTAMP WITH TIME ZONE,
  kilometros_recorridos NUMERIC,
  combustible_usado NUMERIC,
  costo_total NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'cancelado'))
);
\`\`\`

**Campos clave**:
- `estado`: Controla el flujo del reparto (pendiente → en_progreso → completado)
- `hora_inicio` y `hora_fin`: Para calcular duración y eficiencia
- `kilometros_recorridos`: Métrica importante para estadísticas

#### 2.5 Tabla `envios`
Cada paquete/entrega individual.

\`\`\`sql
CREATE TABLE envios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_seguimiento TEXT NOT NULL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  repartidor_id UUID REFERENCES repartidores(id),
  reparto_id UUID REFERENCES repartos(id),
  direccion_origen TEXT NOT NULL,
  latitud_origen NUMERIC NOT NULL,
  longitud_origen NUMERIC NOT NULL,
  direccion_destino TEXT NOT NULL,
  latitud_destino NUMERIC NOT NULL,
  longitud_destino NUMERIC NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  descripcion TEXT,
  peso_kg NUMERIC,
  valor_declarado NUMERIC,
  precio NUMERIC,
  fecha_estimada DATE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  notas_entrega TEXT,
  orden_parada INTEGER,
  tipo_envio TEXT DEFAULT 'entrega',
  distancia_km NUMERIC,
  tiempo_estimado_minutos NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (estado IN ('pendiente', 'impreso', 'asignado', 'en_camino', 'entregado', 'fallido', 'devuelto')),
  CHECK (tipo_envio IN ('entrega', 'recoleccion', 'devolucion'))
);
\`\`\`

**Campos clave**:
- `numero_seguimiento`: Identificador único para tracking
- `orden_parada`: Orden en la ruta optimizada
- `estado`: Ciclo de vida completo del envío
- Coordenadas de origen y destino para cálculos de ruta

#### 2.6 Tabla `paradas_reparto`
Relaciona envíos con repartos en orden específico.

\`\`\`sql
CREATE TABLE paradas_reparto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reparto_id UUID NOT NULL REFERENCES repartos(id),
  envio_id UUID NOT NULL REFERENCES envios(id),
  orden INTEGER NOT NULL,
  completada BOOLEAN DEFAULT false,
  hora_llegada TIMESTAMP WITH TIME ZONE,
  hora_salida TIMESTAMP WITH TIME ZONE,
  hora_real_llegada TIMESTAMP WITH TIME ZONE,
  hora_real_salida TIMESTAMP WITH TIME ZONE,
  notas_parada TEXT,
  estado TEXT DEFAULT 'pendiente',
  firma_cliente TEXT,
  foto_entrega TEXT,
  tiempo_permanencia_minutos NUMERIC,
  hora_estimada_llegada TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (estado IN ('pendiente', 'asignado', 'en_progreso', 'completado', 'fallido')),
  UNIQUE (reparto_id, orden)
);
\`\`\`

**Campos clave**:
- `orden`: Secuencia de paradas en la ruta
- `completada`: Estado binario para progreso visual
- `hora_real_*` vs `hora_estimada_*`: Comparación de eficiencia
- `firma_cliente` y `foto_entrega`: Prueba de entrega

### Índices Recomendados

\`\`\`sql
-- Optimización de consultas frecuentes
CREATE INDEX idx_repartidores_user_auth_id ON repartidores(user_auth_id);
CREATE INDEX idx_repartidores_activo ON repartidores(activo);
CREATE INDEX idx_repartos_repartidor_fecha ON repartos(repartidor_id, fecha);
CREATE INDEX idx_repartos_estado ON repartos(estado);
CREATE INDEX idx_envios_repartidor_id ON envios(repartidor_id);
CREATE INDEX idx_envios_estado ON envios(estado);
CREATE INDEX idx_paradas_reparto_orden ON paradas_reparto(reparto_id, orden);
\`\`\`

---

## 3. Arquitectura de Rutas

### Estructura de Carpetas (Next.js App Router)

\`\`\`
app/
├── (auth)/
│   └── login/
│       └── page.tsx                 # Página de inicio de sesión
│
├── (dashboard)/
│   ├── layout.tsx                   # Layout principal con sidebar y header
│   ├── panel/
│   │   └── page.tsx                 # Dashboard principal
│   ├── repartos/
│   │   ├── page.tsx                 # Lista de repartos
│   │   ├── [id]/
│   │   │   └── page.tsx             # Detalle de reparto individual
│   │   ├── nuevo/
│   │   │   └── page.tsx             # Crear nuevo reparto
│   │   ├── lote/
│   │   │   └── page.tsx             # Crear reparto por lotes
│   │   └── optimizar/
│   │       └── page.tsx             # Optimizador de rutas
│   ├── mapa-rutas/
│   │   └── page.tsx                 # Visualización de mapa
│   ├── envios/
│   │   └── generar/
│   │       └── page.tsx             # Generar nuevos envíos
│   └── perfil/
│       └── page.tsx                 # Perfil del repartidor
│
└── api/
    └── maps-config/
        └── route.ts                 # API route para Google Maps (seguridad)
\`\`\`

### Protección de Rutas

El layout `(dashboard)/layout.tsx` debe implementar:

1. **Verificación de sesión**:
\`\`\`typescript
const supabase = await createClient()
const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

if (sessionError || !sessionData?.session) {
  redirect("/login")
}
\`\`\`

2. **Obtención de datos del repartidor**:
\`\`\`typescript
const { data: userData } = await supabase.auth.getUser()
const { data: repartidor } = await supabase
  .from("repartidores")
  .select("*")
  .eq("user_auth_id", userData.user.id)
  .single()
\`\`\`

3. **Verificación de estado activo**:
\`\`\`typescript
if (!repartidor || !repartidor.activo) {
  redirect("/login?error=inactive")
}
\`\`\`

---

## 4. Componentes Visuales

### 4.1 Layout Principal

#### Sidebar (`components/layout/sidebar.tsx`)

**Diseño Visual**:
- Ancho fijo: 256px (w-64)
- Fondo blanco con sombra suave
- Logo y nombre de la aplicación en la parte superior
- Información del repartidor debajo del logo
- Navegación con iconos y texto
- Resaltado visual de la ruta activa

**Estructura**:
\`\`\`typescript
<div className="w-64 bg-white shadow-lg flex flex-col">
  {/* Header con logo */}
  <div className="p-6 border-b">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-blue-600 rounded-lg">
        <Truck className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold">Rumbo Envíos</h1>
        <p className="text-sm text-gray-500">Sistema de Repartos</p>
      </div>
    </div>
  </div>

  {/* Info del repartidor */}
  <div className="p-4 border-b bg-gray-50">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-green-100 rounded-full">
        <User className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <p className="text-sm font-medium">{nombre} {apellido}</p>
        <p className="text-xs text-gray-500">{vehiculo}</p>
      </div>
    </div>
  </div>

  {/* Navegación */}
  <nav className="flex-1 p-4 space-y-2">
    {/* Botones de navegación */}
  </nav>
</div>
\`\`\`

**Elementos de Navegación**:
1. Panel Principal (LayoutDashboard icon)
2. Mis Repartos (Package icon)
3. Nuevo Reparto (Plus icon)
4. Reparto por Lotes (List icon)
5. Optimizar Rutas (Route icon)
6. Generar Envíos (Send icon)
7. Mapa de Rutas (Map icon)
8. Mi Perfil (User icon)

**Estilo de Botones**:
- Botón activo: `bg-blue-600 text-white`
- Botón inactivo: `bg-transparent text-gray-700 hover:bg-gray-100`
- Transiciones suaves en hover
- Iconos alineados a la izquierda con margen derecho

#### Header (`components/layout/header.tsx`)

**Diseño Visual**:
- Altura: 64px
- Fondo blanco con borde inferior
- Título de la página actual a la izquierda
- Información del usuario y botón de logout a la derecha

**Estructura**:
\`\`\`typescript
<header className="h-16 bg-white border-b px-6 flex items-center justify-between">
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      {titulo de la página}
    </h2>
  </div>
  
  <div className="flex items-center space-x-4">
    {/* Notificaciones (opcional) */}
    <Button variant="ghost" size="icon">
      <Bell className="h-5 w-5" />
    </Button>
    
    {/* Menú de usuario */}
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>{iniciales}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configuración</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>
\`\`\`

### 4.2 Dashboard Principal (`app/(dashboard)/panel/page.tsx`)

**Diseño Visual**:
- Grid responsivo de tarjetas de estadísticas
- Sección de actividad reciente
- Widget de clima (opcional)
- Acciones rápidas

#### Tarjetas de Estadísticas (`components/dashboard/stats-cards.tsx`)

**Layout**: Grid de 4 columnas en desktop, 2 en tablet, 1 en móvil

**Métricas Mostradas**:
1. **Total Repartos**: Número total de repartos asignados
2. **Repartos Completados**: Con icono CheckCircle verde
3. **Repartos Pendientes**: Con icono Clock amarillo
4. **Total Entregas**: Número de envíos individuales
5. **Entregas Exitosas**: Porcentaje de éxito
6. **Entregas Fallidas**: Con icono XCircle rojo
7. **Kilómetros Recorridos**: Suma total con icono MapPin
8. **Eficiencia**: Porcentaje calculado (entregas exitosas / total)

**Estructura de Tarjeta**:
\`\`\`typescript
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-gray-600">
      {titulo}
    </CardTitle>
    <div className={`p-2 rounded-full ${bgColor}`}>
      <Icon className={`h-4 w-4 ${color}`} />
    </div>
  </CardHeader>
  <CardContent>
    <div className={`text-2xl font-bold ${color}`}>
      {valor}
    </div>
  </CardContent>
</Card>
\`\`\`

**Paleta de Colores**:
- Azul (`blue-600`): Información general
- Verde (`green-600`): Éxito/completado
- Amarillo (`yellow-600`): Pendiente/advertencia
- Rojo (`red-600`): Error/fallido
- Púrpura (`purple-600`): Entregas
- Índigo (`indigo-600`): Distancia
- Esmeralda (`emerald-600`): Eficiencia

#### Actividad Reciente (`components/dashboard/recent-activity.tsx`)

**Diseño**:
- Lista de últimas 10 actividades
- Cada item muestra: icono, descripción, timestamp
- Scroll vertical si hay muchos items
- Colores según tipo de actividad

**Tipos de Actividad**:
- Reparto iniciado (azul)
- Entrega completada (verde)
- Entrega fallida (rojo)
- Ruta optimizada (púrpura)

### 4.3 Lista de Repartos (`app/(dashboard)/repartos/page.tsx`)

**Diseño Visual**:
- Dos vistas: Tabla y Tarjetas (toggle button)
- Filtros en la parte superior
- Botones de acción: "Nuevo Reparto" y "Reparto por Lotes"

#### Vista de Tabla (`components/repartos/repartos-table.tsx`)

**Columnas**:
1. **Fecha**: Con icono Calendar
2. **Estado**: Badge con color según estado
3. **Paradas**: Número total con icono Package
4. **Progreso**: Barra de progreso visual + porcentaje
5. **Kilómetros**: Con icono MapPin
6. **Acciones**: Botón "Ver" que redirige al detalle

**Barra de Progreso**:
\`\`\`typescript
<div className="w-full bg-gray-200 rounded-full h-1.5">
  <div 
    className="bg-blue-600 h-1.5 rounded-full transition-all"
    style={{ width: `${porcentaje}%` }}
  />
</div>
\`\`\`

**Estados y Colores**:
- `pendiente`: Amarillo (`yellow-100` bg, `yellow-800` text)
- `en_progreso`: Azul (`blue-100` bg, `blue-800` text)
- `completado`: Verde (`green-100` bg, `green-800` text)
- `cancelado`: Rojo (`red-100` bg, `red-800` text)

#### Vista de Tarjetas

**Layout**: Grid de 3 columnas en desktop, 2 en tablet, 1 en móvil

**Contenido de Tarjeta**:
- Fecha en el header
- Badge de estado
- Progreso de paradas (X/Y completadas)
- Kilómetros recorridos
- Barra de progreso visual
- Botón "Ver Detalles" al final

### 4.4 Mapa de Rutas (`app/(dashboard)/mapa-rutas/page.tsx`)

**Componente Principal**: `components/mapa/mapa-rutas.tsx`

**Diseño Visual**:
- Mapa ocupa el 75% del ancho (3 columnas de 4)
- Panel de filtros a la izquierda (1 columna)
- Estadísticas en la parte superior
- Altura del mapa: 600px

#### Implementación del Mapa

**Carga de Google Maps**:
\`\`\`typescript
useEffect(() => {
  // Obtener URL del script desde API route segura
  fetch("/api/maps-config")
    .then(res => res.json())
    .then(data => {
      const script = document.createElement("script")
      script.src = data.scriptUrl
      script.async = true
      script.defer = true
      script.onload = () => setMapsLoaded(true)
      document.head.appendChild(script)
    })
}, [])
\`\`\`

**Inicialización del Mapa**:
\`\`\`typescript
const map = new google.maps.Map(mapRef.current, {
  zoom: 12,
  center: { lat: -38.0109, lng: -57.5991 }, // Mar del Plata por defecto
  mapTypeControl: false,
  streetViewControl: false,
  mapId: "DEMO_MAP_ID"
})
\`\`\`

**Tipos de Marcadores**:

1. **Centros de Distribución (Empresas)**:
   - Color: Verde (`#10b981`)
   - Tamaño: 36px
   - Icono: Building/Warehouse
   - Borde blanco de 3px
   - Sombra pronunciada

2. **Paradas de Entrega**:
   - Color según estado del reparto:
     - Pendiente: Amarillo (`#eab308`)
     - En progreso: Azul (`#3b82f6`)
     - Completado: Verde (`#10b981`)
     - Cancelado: Rojo (`#ef4444`)
   - Tamaño: 30px
   - Número de orden dentro del círculo
   - Borde blanco de 2px

**InfoWindow (Ventana de Información)**:
\`\`\`html
<div class="p-2">
  <h3 class="font-semibold">{nombre_cliente}</h3>
  <p class="text-sm text-gray-600">{direccion}</p>
  <p class="text-sm">Reparto #{id} - {fecha}</p>
  <p class="text-sm">Estado: <span style="color:{color}">{estado}</span></p>
  <p class="text-sm">Repartidor: {nombre} {apellido}</p>
</div>
\`\`\`

**Funcionalidad de Rutas**:
- Botón "Abrir en Google Maps" que genera URL con waypoints
- Formato: `https://www.google.com/maps/dir/?api=1&origin={lat,lng}&waypoints={lat1,lng1|lat2,lng2}&travelmode=driving`

#### Filtros del Mapa (`components/mapa/filtros-mapa-rutas.tsx`)

**Opciones de Filtro**:
1. **Por Estado**: Checkboxes múltiples
2. **Por Fecha**: Date picker
3. **Por Repartidor**: Select dropdown (si es admin)

**Diseño**:
- Card con fondo blanco
- Título "Filtros"
- Separadores entre secciones
- Botón "Limpiar Filtros" al final

#### Estadísticas del Mapa (`components/mapa/estadisticas-mapa-rutas.tsx`)

**Métricas Mostradas**:
- Total de repartos activos
- Total de paradas
- Paradas completadas
- Kilómetros totales estimados

**Layout**: Grid de 4 columnas, tarjetas compactas

### 4.5 Detalle de Reparto (`app/(dashboard)/repartos/[id]/page.tsx`)

**Secciones**:

1. **Header del Reparto** (`components/repartos/reparto-header.tsx`):
   - Fecha y estado
   - Botones de acción: Iniciar, Completar, Cancelar
   - Información del repartidor
   - Estadísticas: paradas, km, tiempo

2. **Mapa del Reparto** (`components/repartos/reparto-map.tsx`):
   - Similar al mapa de rutas pero enfocado en un solo reparto
   - Muestra la ruta completa con líneas conectando paradas
   - Numeración clara de paradas

3. **Lista de Paradas** (`components/repartos/paradas-list.tsx`):
   - Tabla o lista ordenada
   - Cada parada muestra:
     - Número de orden
     - Cliente y dirección
     - Estado (checkbox de completada)
     - Hora estimada vs real
     - Botones: "Marcar como completada", "Ver en mapa", "Llamar"
   - Drag & drop para reordenar (opcional)

**Acciones de Parada**:
\`\`\`typescript
<div className="flex space-x-2">
  <Button size="sm" onClick={() => marcarCompletada(parada.id)}>
    <Check className="h-4 w-4" />
  </Button>
  <Button size="sm" variant="outline" onClick={() => abrirEnMapa(parada)}>
    <MapPin className="h-4 w-4" />
  </Button>
  <Button size="sm" variant="outline" onClick={() => llamarCliente(parada)}>
    <Phone className="h-4 w-4" />
  </Button>
</div>
\`\`\`

### 4.6 Optimizador de Rutas (`app/(dashboard)/repartos/optimizar/page.tsx`)

**Flujo de Uso**:
1. Seleccionar envíos pendientes (checkboxes)
2. Elegir punto de origen (empresa)
3. Configurar parámetros de optimización
4. Ejecutar algoritmo
5. Visualizar ruta optimizada en mapa
6. Confirmar y crear reparto

**Componente de Optimización** (`components/repartos/optimizador-ruta.tsx`):

**Parámetros Configurables**:
- Prioridad: Distancia vs Tiempo
- Ventanas horarias
- Capacidad del vehículo
- Restricciones de tráfico

**Visualización de Resultado**:
- Mapa con ruta trazada
- Lista ordenada de paradas
- Métricas: distancia total, tiempo estimado, ahorro vs ruta sin optimizar
- Comparación antes/después

**Algoritmo de Optimización**:
- Usar Google Maps Directions API con waypoints optimization
- O implementar algoritmo propio (TSP - Traveling Salesman Problem)
- Considerar ventanas horarias y prioridades

### 4.7 Generación de Envíos (`app/(dashboard)/envios/generar/page.tsx`)

**Formulario de Envío** (`components/envios/generar-envio-form.tsx`):

**Campos del Formulario**:
1. **Información del Cliente**:
   - Búsqueda de cliente existente o crear nuevo
   - Nombre, teléfono, email
   - Dirección con autocompletado (Google Places API)

2. **Detalles del Envío**:
   - Descripción del paquete
   - Peso (kg)
   - Valor declarado
   - Tipo de envío (entrega, recolección, devolución)

3. **Origen y Destino**:
   - Selector de ubicación con mapa
   - Autocompletado de direcciones
   - Coordenadas automáticas

4. **Precio**:
   - Calculadora automática basada en distancia y peso
   - Posibilidad de ajuste manual

**Componentes Auxiliares**:

- **Búsqueda de Cliente** (`components/envios/busqueda-cliente.tsx`):
  - Input con búsqueda en tiempo real
  - Resultados en dropdown
  - Opción "Crear nuevo cliente"

- **Selector de Ubicación** (`components/envios/selector-ubicacion.tsx`):
  - Mapa interactivo
  - Marcador arrastrable
  - Autocompletado de direcciones
  - Botón "Usar mi ubicación"

- **Calculadora de Precio** (`components/envios/calculadora-precio.tsx`):
  - Cálculo automático basado en:
    - Distancia (km)
    - Peso (kg)
    - Zona de entrega
    - Tipo de servicio
  - Muestra desglose de costos

**Flujo de Creación**:
1. Buscar o crear cliente
2. Ingresar dirección de destino
3. Calcular precio automáticamente
4. Revisar detalles
5. Generar número de seguimiento único
6. Crear envío en estado "pendiente"
7. Opción de imprimir etiqueta

### 4.8 Perfil del Repartidor (`app/(dashboard)/perfil/page.tsx`)

**Secciones**:

1. **Información Personal**:
   - Foto de perfil (avatar)
   - Nombre completo
   - Email y teléfono
   - Fecha de ingreso
   - Empresa asignada

2. **Información del Vehículo**:
   - Tipo de vehículo
   - Matrícula
   - Licencia de conducir

3. **Estadísticas Personales**:
   - Total de repartos realizados
   - Tasa de éxito
   - Kilómetros totales
   - Entregas este mes
   - Ranking (opcional)

4. **Formulario de Edición** (`components/perfil/perfil-form.tsx`):
   - Campos editables
   - Validación en tiempo real
   - Botón "Guardar cambios"
   - Cambio de contraseña

**Diseño Visual**:
- Layout de dos columnas: info a la izquierda, estadísticas a la derecha
- Tarjetas con sombra suave
- Iconos descriptivos para cada sección
- Gráficos de rendimiento (opcional)

---

## 5. Funcionalidades Principales

### 5.1 Autenticación y Autorización

**Flujo de Login**:
1. Usuario ingresa email y contraseña
2. Supabase Auth valida credenciales
3. Se obtiene el `user_auth_id`
4. Se busca el repartidor asociado en la tabla `repartidores`
5. Se verifica que `activo = true`
6. Se crea sesión y se redirige al dashboard

**Middleware de Protección**:
\`\`\`typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && request.nextUrl.pathname.startsWith('/panel')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}
\`\`\`

### 5.2 Gestión de Repartos

**Crear Nuevo Reparto**:
1. Seleccionar envíos pendientes
2. Asignar al repartidor actual
3. Optimizar orden de paradas (opcional)
4. Crear registro en tabla `repartos`
5. Crear registros en `paradas_reparto` con orden
6. Actualizar `reparto_id` en tabla `envios`
7. Cambiar estado de envíos a "asignado"

**Iniciar Reparto**:
1. Cambiar estado de reparto a "en_progreso"
2. Registrar `hora_inicio`
3. Cambiar estado de envíos a "en_camino"
4. Habilitar tracking en tiempo real (opcional)

**Completar Parada**:
1. Marcar `completada = true` en `paradas_reparto`
2. Registrar `hora_real_llegada` y `hora_real_salida`
3. Cambiar estado de envío a "entregado" o "fallido"
4. Registrar `fecha_entrega` en tabla `envios`
5. Opcionalmente: capturar firma y foto
6. Actualizar progreso del reparto

**Finalizar Reparto**:
1. Verificar que todas las paradas estén completadas
2. Cambiar estado a "completado"
3. Registrar `hora_fin`
4. Calcular `kilometros_recorridos` (suma de distancias)
5. Calcular métricas de eficiencia
6. Generar reporte (opcional)

### 5.3 Optimización de Rutas

**Algoritmo Básico** (usando Google Maps):
\`\`\`typescript
async function optimizarRuta(paradas: Parada[], origen: Coordenadas) {
  const waypoints = paradas.map(p => ({
    location: { lat: p.latitud, lng: p.longitud },
    stopover: true
  }))
  
  const request = {
    origin: origen,
    destination: origen, // Volver al origen
    waypoints: waypoints,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  }
  
  const result = await directionsService.route(request)
  const ordenOptimizado = result.routes[0].waypoint_order
  
  return paradas.map((p, i) => ({
    ...p,
    orden: ordenOptimizado[i] + 1
  }))
}
\`\`\`

**Consideraciones**:
- Límite de 25 waypoints por request de Google Maps
- Para más paradas, dividir en múltiples repartos
- Considerar ventanas horarias de clientes
- Priorizar entregas urgentes
- Evitar zonas de tráfico pesado en horas pico

### 5.4 Tracking en Tiempo Real (Opcional)

**Implementación con Geolocation API**:
\`\`\`typescript
useEffect(() => {
  if (repartoActivo) {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        actualizarUbicacion(repartoId, latitude, longitude)
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
    
    return () => navigator.geolocation.clearWatch(watchId)
  }
}, [repartoActivo])
\`\`\`

**Almacenamiento**:
- Crear tabla `ubicaciones_tiempo_real` con campos:
  - `repartidor_id`
  - `reparto_id`
  - `latitud`
  - `longitud`
  - `timestamp`
  - `velocidad`
  - `rumbo`

**Visualización**:
- Marcador del repartidor en el mapa que se actualiza cada 10-30 segundos
- Línea de ruta recorrida
- ETA actualizado para cada parada

### 5.5 Cálculo de Precios

**Fórmula Base**:
\`\`\`typescript
function calcularPrecio(distanciaKm: number, pesoKg: number, zona: string) {
  const tarifaBase = 5.00 // Precio mínimo
  const costoPorKm = 1.50
  const costoPorKg = 0.50
  const multiplicadorZona = zonas[zona] || 1.0
  
  const precioDistancia = distanciaKm * costoPorKm
  const precioPeso = pesoKg * costoPorKg
  const subtotal = tarifaBase + precioDistancia + precioPeso
  
  return subtotal * multiplicadorZona
}
\`\`\`

**Factores Adicionales**:
- Urgencia (entrega express: +50%)
- Seguro (basado en valor declarado)
- Horario (entregas nocturnas: +30%)
- Día (fines de semana: +20%)

### 5.6 Generación de Reportes

**Reporte Diario**:
- Total de repartos completados
- Total de entregas exitosas/fallidas
- Kilómetros recorridos
- Tiempo total en ruta
- Eficiencia (entregas por hora)
- Ingresos generados

**Reporte Mensual**:
- Tendencias de rendimiento
- Comparación con meses anteriores
- Ranking de repartidores
- Zonas más atendidas
- Clientes frecuentes

**Exportación**:
- PDF para impresión
- Excel para análisis
- JSON para integración con otros sistemas

---

## 6. Diseño y Estilo Visual

### 6.1 Sistema de Colores

**Paleta Principal**:
\`\`\`css
:root {
  /* Primarios */
  --primary-blue: #3b82f6;
  --primary-blue-dark: #2563eb;
  --primary-blue-light: #60a5fa;
  
  /* Secundarios */
  --success-green: #10b981;
  --warning-yellow: #eab308;
  --error-red: #ef4444;
  --info-purple: #8b5cf6;
  
  /* Neutrales */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-600: #4b5563;
  --gray-900: #111827;
  
  /* Fondos */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
}
\`\`\`

**Uso de Colores**:
- **Azul**: Acciones principales, enlaces, elementos interactivos
- **Verde**: Éxito, completado, confirmación
- **Amarillo**: Advertencias, pendiente, atención
- **Rojo**: Errores, cancelado, fallido
- **Púrpura**: Información adicional, estadísticas especiales
- **Gris**: Texto, bordes, fondos neutros

### 6.2 Tipografía

**Fuentes Recomendadas**:
- **Sans-serif moderna**: Inter, Poppins, o system-ui
- **Monospace** (para números): JetBrains Mono, Fira Code

**Escala Tipográfica**:
\`\`\`css
/* Títulos */
.text-3xl { font-size: 1.875rem; } /* H1 - Títulos de página */
.text-2xl { font-size: 1.5rem; }   /* H2 - Subtítulos */
.text-xl { font-size: 1.25rem; }   /* H3 - Secciones */
.text-lg { font-size: 1.125rem; }  /* H4 - Subsecciones */

/* Cuerpo */
.text-base { font-size: 1rem; }    /* Texto normal */
.text-sm { font-size: 0.875rem; }  /* Texto secundario */
.text-xs { font-size: 0.75rem; }   /* Texto pequeño */
\`\`\`

**Pesos**:
- `font-normal` (400): Texto de cuerpo
- `font-medium` (500): Énfasis leve
- `font-semibold` (600): Subtítulos, labels
- `font-bold` (700): Títulos, números importantes

### 6.3 Espaciado y Layout

**Sistema de Espaciado** (basado en Tailwind):
\`\`\`
p-2  = 0.5rem  (8px)
p-4  = 1rem    (16px)
p-6  = 1.5rem  (24px)
p-8  = 2rem    (32px)
\`\`\`

**Márgenes Consistentes**:
- Entre secciones: `space-y-6` (24px)
- Entre elementos: `space-y-4` (16px)
- Entre componentes pequeños: `space-y-2` (8px)

**Contenedores**:
- Ancho máximo de contenido: `max-w-7xl` (1280px)
- Padding horizontal: `px-6` en desktop, `px-4` en móvil

### 6.4 Componentes UI (shadcn/ui)

**Componentes Utilizados**:
- `Button`: Acciones principales y secundarias
- `Card`: Contenedores de información
- `Badge`: Estados y etiquetas
- `Table`: Listas de datos
- `Dialog`: Modales y confirmaciones
- `Select`: Dropdowns y selectores
- `Input`: Campos de texto
- `Checkbox`: Selección múltiple
- `Switch`: Toggle on/off
- `Tabs`: Navegación entre vistas
- `Progress`: Barras de progreso
- `Avatar`: Fotos de perfil
- `Tooltip`: Información adicional

**Variantes de Botones**:
\`\`\`typescript
// Primario (acciones principales)
<Button>Guardar</Button>

// Secundario (acciones alternativas)
<Button variant="outline">Cancelar</Button>

// Destructivo (acciones peligrosas)
<Button variant="destructive">Eliminar</Button>

// Ghost (acciones sutiles)
<Button variant="ghost">Ver más</Button>

// Link (navegación)
<Button variant="link">Ir a perfil</Button>
\`\`\`

### 6.5 Iconografía

**Librería**: Lucide React

**Iconos Principales**:
- `LayoutDashboard`: Panel principal
- `Package`: Repartos y paquetes
- `Truck`: Vehículos y transporte
- `MapPin`: Ubicaciones y mapas
- `User`: Perfil y usuarios
- `Calendar`: Fechas
- `Clock`: Tiempo y horarios
- `CheckCircle`: Completado/éxito
- `XCircle`: Error/fallido
- `AlertCircle`: Advertencia
- `Plus`: Agregar/crear
- `Edit`: Editar
- `Trash`: Eliminar
- `Eye`: Ver detalles
- `Phone`: Llamar
- `Mail`: Email
- `Navigation`: Navegación/GPS

**Tamaños Estándar**:
- Pequeño: `h-4 w-4` (16px)
- Mediano: `h-5 w-5` (20px)
- Grande: `h-6 w-6` (24px)

### 6.6 Responsive Design

**Breakpoints**:
\`\`\`css
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeño */
xl: 1280px  /* Desktop grande */
\`\`\`

**Estrategia Mobile-First**:
1. Diseñar primero para móvil (320px-640px)
2. Adaptar para tablet (640px-1024px)
3. Optimizar para desktop (1024px+)

**Adaptaciones Clave**:
- **Sidebar**: Oculto en móvil, mostrar con menú hamburguesa
- **Tablas**: Convertir a cards en móvil
- **Grid de estadísticas**: 1 columna en móvil, 2 en tablet, 4 en desktop
- **Mapa**: Altura reducida en móvil (400px vs 600px)
- **Formularios**: Campos apilados en móvil, lado a lado en desktop

### 6.7 Animaciones y Transiciones

**Transiciones Suaves**:
\`\`\`css
.transition-all { transition: all 150ms ease-in-out; }
.transition-colors { transition: color, background-color 150ms ease-in-out; }
.transition-shadow { transition: box-shadow 150ms ease-in-out; }
\`\`\`

**Hover Effects**:
- Botones: Cambio de color + elevación sutil
- Cards: Sombra más pronunciada
- Links: Subrayado animado

**Loading States**:
- Spinner para carga de datos
- Skeleton screens para contenido
- Progress bar para procesos largos

---

## 7. Integración con APIs

### 7.1 Google Maps API

**Configuración Segura**:
\`\`\`typescript
// app/api/maps-config/route.ts
export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY // Sin NEXT_PUBLIC_
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }
  
  return NextResponse.json({
    scriptUrl: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker`
  })
}
\`\`\`

**APIs Utilizadas**:
1. **Maps JavaScript API**: Visualización de mapas
2. **Places API**: Autocompletado de direcciones
3. **Directions API**: Cálculo de rutas
4. **Distance Matrix API**: Cálculo de distancias
5. **Geocoding API**: Conversión dirección ↔ coordenadas

**Límites y Costos**:
- Maps JavaScript API: $7 por 1000 cargas
- Directions API: $5 por 1000 requests
- Places Autocomplete: $2.83 por 1000 requests
- Implementar caché para reducir costos

### 7.2 Supabase

**Cliente del Servidor**:
\`\`\`typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
\`\`\`

**Cliente del Navegador**:
\`\`\`typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
\`\`\`

**Queries Comunes**:

\`\`\`typescript
// Obtener repartos del repartidor
const { data: repartos } = await supabase
  .from('repartos')
  .select(`
    *,
    paradas_reparto (
      *,
      envios (
        *,
        clientes (*)
      )
    )
  `)
  .eq('repartidor_id', repartidorId)
  .order('fecha', { ascending: false })

// Actualizar estado de envío
await supabase
  .from('envios')
  .update({ estado: 'entregado', fecha_entrega: new Date() })
  .eq('id', envioId)

// Marcar parada como completada
await supabase
  .from('paradas_reparto')
  .update({ 
    completada: true,
    hora_real_llegada: new Date()
  })
  .eq('id', paradaId)
\`\`\`

### 7.3 Server Actions

**Ejemplo de Server Action**:
\`\`\`typescript
// app/actions/repartos.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function iniciarReparto(repartoId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('repartos')
    .update({
      estado: 'en_progreso',
      hora_inicio: new Date().toISOString()
    })
    .eq('id', repartoId)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/repartos')
  return { success: true }
}

export async function completarParada(paradaId: string, notas?: string) {
  const supabase = await createClient()
  
  const { data: parada, error: paradaError } = await supabase
    .from('paradas_reparto')
    .update({
      completada: true,
      hora_real_llegada: new Date().toISOString(),
      notas_parada: notas
    })
    .eq('id', paradaId)
    .select('envio_id')
    .single()
  
  if (paradaError) {
    return { success: false, error: paradaError.message }
  }
  
  // Actualizar estado del envío
  await supabase
    .from('envios')
    .update({
      estado: 'entregado',
      fecha_entrega: new Date().toISOString()
    })
    .eq('id', parada.envio_id)
  
  revalidatePath('/repartos')
  return { success: true }
}
\`\`\`

---

## 8. Flujo de Usuario

### 8.1 Flujo Completo de un Día de Trabajo

**Mañana (Preparación)**:
1. Repartidor inicia sesión
2. Ve dashboard con resumen del día
3. Revisa repartos asignados en "Mis Repartos"
4. Abre detalle del reparto del día
5. Revisa lista de paradas y mapa de ruta
6. Opcionalmente optimiza la ruta
7. Presiona "Iniciar Reparto"

**Durante el Día (Ejecución)**:
1. Navega a primera parada usando Google Maps
2. Al llegar, marca parada como "En progreso"
3. Realiza la entrega
4. Marca parada como "Completada"
5. Opcionalmente: captura firma y foto
6. Agrega notas si hay incidencias
7. Repite para cada parada
8. Visualiza progreso en tiempo real

**Tarde (Cierre)**:
1. Completa última parada
2. Presiona "Finalizar Reparto"
3. Sistema calcula kilómetros y tiempo
4. Revisa resumen del día en dashboard
5. Verifica estadísticas actualizadas
6. Cierra sesión

### 8.2 Flujo de Creación de Envío

1. Navega a "Generar Envíos"
2. Busca cliente existente o crea nuevo
3. Ingresa dirección de destino (con autocompletado)
4. Sistema geocodifica y muestra en mapa
5. Ingresa detalles del paquete (peso, descripción)
6. Sistema calcula precio automáticamente
7. Revisa y ajusta precio si es necesario
8. Presiona "Crear Envío"
9. Sistema genera número de seguimiento
10. Opción de imprimir etiqueta
11. Envío queda en estado "pendiente"

### 8.3 Flujo de Optimización de Ruta

1. Navega a "Optimizar Rutas"
2. Ve lista de envíos pendientes
3. Selecciona envíos para incluir (checkboxes)
4. Elige punto de origen (empresa)
5. Configura parámetros (prioridad, restricciones)
6. Presiona "Optimizar"
7. Sistema calcula ruta óptima
8. Ve visualización en mapa con orden sugerido
9. Revisa métricas (distancia, tiempo)
10. Ajusta manualmente si es necesario (drag & drop)
11. Presiona "Crear Reparto"
12. Sistema crea reparto con paradas ordenadas

### 8.4 Flujo de Gestión de Incidencias

**Entrega Fallida**:
1. En detalle de parada, presiona "Marcar como Fallida"
2. Selecciona motivo (cliente ausente, dirección incorrecta, etc.)
3. Agrega notas adicionales
4. Opcionalmente toma foto de evidencia
5. Sistema actualiza estado a "fallido"
6. Envío vuelve a estado "pendiente" para reintento

**Cambio de Dirección**:
1. Cliente llama para cambiar dirección
2. Repartidor edita dirección en detalle de parada
3. Sistema recalcula distancia y tiempo
4. Actualiza orden de paradas si es necesario
5. Notifica cambio en el sistema

**Cancelación de Envío**:
1. En detalle de envío, presiona "Cancelar"
2. Confirma acción en modal
3. Ingresa motivo de cancelación
4. Sistema actualiza estado a "cancelado"
5. Remueve de paradas activas
6. Registra en historial

---

## 9. Consideraciones Técnicas Adicionales

### 9.1 Performance

**Optimizaciones**:
- Lazy loading de componentes pesados (mapas)
- Paginación en listas largas
- Caché de datos frecuentes (clientes, empresas)
- Compresión de imágenes
- Code splitting por ruta

**Métricas a Monitorear**:
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

### 9.2 Seguridad

**Row Level Security (RLS) en Supabase**:
\`\`\`sql
-- Repartidores solo ven sus propios datos
CREATE POLICY "Repartidores ven sus repartos"
ON repartos FOR SELECT
USING (
  repartidor_id IN (
    SELECT id FROM repartidores 
    WHERE user_auth_id = auth.uid()
  )
);

-- Repartidores solo actualizan sus repartos
CREATE POLICY "Repartidores actualizan sus repartos"
ON repartos FOR UPDATE
USING (
  repartidor_id IN (
    SELECT id FROM repartidores 
    WHERE user_auth_id = auth.uid()
  )
);
\`\`\`

**Validación de Datos**:
- Validar en cliente y servidor
- Sanitizar inputs
- Usar prepared statements
- Limitar tamaño de uploads

### 9.3 Accesibilidad

**Requisitos WCAG 2.1**:
- Contraste mínimo 4.5:1 para texto
- Navegación por teclado completa
- Labels descriptivos en formularios
- Alt text en imágenes
- ARIA labels en componentes interactivos
- Focus visible en elementos

**Implementación**:
\`\`\`typescript
<Button
  aria-label="Marcar parada como completada"
  onClick={handleCompletar}
>
  <Check className="h-4 w-4" />
  <span className="sr-only">Completar</span>
</Button>
\`\`\`

### 9.4 Testing

**Tipos de Tests**:
1. **Unit Tests**: Funciones de cálculo, utilidades
2. **Integration Tests**: Flujos completos (crear reparto, completar parada)
3. **E2E Tests**: Flujos de usuario críticos

**Herramientas Recomendadas**:
- Jest para unit tests
- React Testing Library para componentes
- Playwright para E2E

### 9.5 Monitoreo y Logs

**Eventos a Registrar**:
- Inicio/fin de sesión
- Creación de repartos
- Cambios de estado
- Errores de API
- Tiempos de respuesta

**Herramientas**:
- Vercel Analytics
- Sentry para error tracking
- LogRocket para session replay

---

## 10. Checklist de Implementación

### Fase 1: Fundamentos (Semana 1-2)
- [ ] Configurar proyecto Next.js 15+
- [ ] Instalar y configurar shadcn/ui
- [ ] Configurar Supabase
- [ ] Crear esquema de base de datos
- [ ] Implementar autenticación
- [ ] Crear layout principal (sidebar + header)
- [ ] Implementar protección de rutas

### Fase 2: Dashboard y Repartos (Semana 3-4)
- [ ] Crear página de dashboard con estadísticas
- [ ] Implementar lista de repartos
- [ ] Crear página de detalle de reparto
- [ ] Implementar acciones de reparto (iniciar, completar)
- [ ] Crear componente de lista de paradas
- [ ] Implementar marcado de paradas completadas

### Fase 3: Mapas y Rutas (Semana 5-6)
- [ ] Configurar Google Maps API (segura)
- [ ] Implementar mapa de rutas general
- [ ] Crear mapa de reparto individual
- [ ] Implementar marcadores y info windows
- [ ] Crear optimizador de rutas
- [ ] Integrar con Directions API

### Fase 4: Gestión de Envíos (Semana 7-8)
- [ ] Crear formulario de generación de envíos
- [ ] Implementar búsqueda de clientes
- [ ] Crear selector de ubicación con mapa
- [ ] Implementar calculadora de precios
- [ ] Crear sistema de autocompletado de direcciones
- [ ] Implementar generación de número de seguimiento

### Fase 5: Perfil y Extras (Semana 9-10)
- [ ] Crear página de perfil
- [ ] Implementar edición de datos personales
- [ ] Crear sistema de estadísticas personales
- [ ] Implementar cambio de contraseña
- [ ] Crear widget de clima (opcional)
- [ ] Implementar notificaciones (opcional)

### Fase 6: Optimización y Testing (Semana 11-12)
- [ ] Optimizar performance (lazy loading, caché)
- [ ] Implementar responsive design completo
- [ ] Escribir tests unitarios
- [ ] Realizar tests E2E
- [ ] Configurar monitoreo y logs
- [ ] Documentar código y APIs

### Fase 7: Deployment (Semana 13)
- [ ] Configurar variables de entorno en producción
- [ ] Desplegar en Vercel
- [ ] Configurar dominio personalizado
- [ ] Realizar pruebas en producción
- [ ] Capacitar usuarios
- [ ] Lanzamiento

---

## 11. Recursos y Referencias

### Documentación Oficial
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Librerías Útiles
- `@supabase/ssr`: Cliente de Supabase para Next.js
- `lucide-react`: Iconos
- `date-fns`: Manejo de fechas
- `zod`: Validación de esquemas
- `react-hook-form`: Formularios
- `recharts`: Gráficos (opcional)

### Ejemplos de Código
- [Supabase Auth con Next.js](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
- [Google Maps con React](https://github.com/googlemaps/js-samples)
- [shadcn/ui Examples](https://ui.shadcn.com/examples)

---

## Conclusión

Esta guía proporciona una descripción completa y detallada de cómo implementar el panel del repartidor. Incluye:

✅ **Estructura de base de datos** con todas las tablas y relaciones necesarias
✅ **Arquitectura de rutas** siguiendo las mejores prácticas de Next.js
✅ **Componentes visuales** con especificaciones de diseño detalladas
✅ **Funcionalidades principales** con ejemplos de código
✅ **Sistema de diseño** completo con colores, tipografía y espaciado
✅ **Integración con APIs** externas (Google Maps, Supabase)
✅ **Flujos de usuario** paso a paso
✅ **Consideraciones técnicas** de performance, seguridad y accesibilidad
✅ **Checklist de implementación** con timeline sugerido

Con esta documentación, un equipo de desarrollo puede replicar completamente el sistema de gestión de repartos, manteniendo la misma estructura visual, funcionalidades y experiencia de usuario del proyecto original.

**Tiempo estimado de implementación**: 10-13 semanas con un equipo de 2-3 desarrolladores.

**Nivel de complejidad**: Intermedio-Avanzado

**Stack recomendado**: Next.js 15, Supabase, shadcn/ui, Google Maps API, Tailwind CSS
