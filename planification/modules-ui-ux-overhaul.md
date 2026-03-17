# Módulos principales — Plan de mejora UI/UX + Infraestructura

## Diagnóstico general

### Backend — lo que falta
Ningún endpoint de listado tiene soporte de paginación ni búsqueda. Todos retornan arrays crudos:

| Módulo      | Endpoint               | Paginación | Búsqueda/Filtros |
|-------------|------------------------|------------|------------------|
| Clientes    | GET /clients           | ✗          | ✗                |
| Conexiones  | GET /connections       | ✗          | ✗                |
| Servicios   | GET /services          | ✗          | ✗                |
| Deals       | GET /:ws/deals         | ✗          | ✗ (solo status en frontend) |
| Proyectos   | GET /:ws/projects      | ✗          | ✗                |
| Plantillas  | GET /:ws/brief-templates | ✗        | ✗                |

### Frontend — lo que falta
- `DataTable` no tiene slot para barra de búsqueda/filtros/acciones
- No existe `AppSearch`, `AppPagination`, ni `AppFilters`
- Cada hook (`useDeals`, `useProjects`…) hace fetch sin parámetros
- Las páginas construyen su propia lógica ad-hoc (deals tiene tabs de status, el resto nada)
- No hay `useListState` genérico — cada página re-inventaría lo mismo
- Empty states son genéricos, sin contexto por módulo

---

## Fase 1 — Backend: paginación + búsqueda

### 1.1 DTO común reutilizable
Crear `backend/src/common/dto/pagination-query.dto.ts`:
```ts
export class PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;

  @IsOptional() @IsString()
  search?: string;          // búsqueda genérica por nombre

  @IsOptional() @IsString()
  sortBy?: string;          // campo a ordenar

  @IsOptional() @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

Respuesta paginada estandarizada `PaginatedResponseDto<T>`:
```ts
{ data: T[], total: number, page: number, limit: number, totalPages: number }
```

### 1.2 Extender por módulo

**Clientes** — `ClientsQueryDto extends PaginationQueryDto`:
- `type?: ClientType` (PERSON | COMPANY)
- `country?: string`

**Deals** — `DealsQueryDto extends PaginationQueryDto`:
- `status?: DealStatus` (ya está en frontend, subirlo al backend)
- `clientId?: string`

**Servicios** — `ServicesQueryDto extends PaginationQueryDto`:
- `category?: string`
- `chargeType?: ServiceChargeType`
- `isActive?: boolean`

**Proyectos** — `ProjectsQueryDto extends PaginationQueryDto`:
- `status?: ProjectStatus`

**Plantillas (Brief Templates)** — `BriefTemplatesQueryDto extends PaginationQueryDto`:
- `isActive?: boolean`

**Conexiones** — paginación simple, sin filtros complejos.

### 1.3 Implementación en servicios (TypeORM)
En cada `.service.ts` usar `queryBuilder` con:
```ts
.where('entity.workspaceId = :workspaceId', { workspaceId })
.andWhere(search ? 'entity.name ILIKE :search' : '1=1', { search: `%${search}%` })
.orderBy(`entity.${sortBy}`, sortOrder.toUpperCase())
.skip((page - 1) * limit)
.take(limit)
.getManyAndCount()
```

---

## Fase 2 — Frontend: infraestructura de listados

### 2.1 Hook genérico `useListState`
Crear `frontend-app/src/hooks/use-list-state.ts`:

```ts
// Maneja: búsqueda (debounced), filtros, paginación, y reset
function useListState<Filters>(defaults: Filters) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<Filters>(defaults);
  const [page, setPage] = useState(1);

  // Reset página cuando cambia búsqueda o filtros
  useEffect(() => setPage(1), [debouncedSearch, filters]);

  const setFilter = (key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  return { search, setSearch, debouncedSearch, filters, setFilter, page, setPage };
}
```

### 2.2 Actualizar hooks individuales
Cada hook (`useDeals`, `useClients`, etc.) debe aceptar los parámetros del `useListState`:

```ts
// Ejemplo: use-deals.ts
function useDeals(params: { search?: string; status?: DealStatus; page?: number; limit?: number }) {
  // fetch con query params → respuesta paginada
  // retorna: { deals, total, totalPages, isLoading, ... }
}
```

### 2.3 Nuevos componentes comunes

#### `AppSearch` — `components/common/AppSearch.tsx`
```tsx
// Input de búsqueda con icono lupa, debounce interno (opcional), clear button
<AppSearch placeholder="Buscar clientes..." value={search} onChange={setSearch} />
```

#### `AppPagination` — `components/common/AppPagination.tsx`
```tsx
// Prev/Next + "Página X de Y" + info de registros
// Props: page, totalPages, total, limit, onPageChange
```

#### `AppFilterTabs` — `components/common/AppFilterTabs.tsx`
```tsx
// Tabs de filtro rápido (como el de status en Deals, pero genérico)
// Props: options: {label, value, count?}[], value, onChange
```

### 2.4 Mejorar `DataTable`
Agregar prop `toolbar?: React.ReactNode` — slot que se renderiza arriba de la tabla:

```tsx
// DataTable recibe toolbar y lo pone encima del <Table>
<DataTable
  toolbar={
    <div className="flex items-center gap-3 p-4 border-b">
      <AppSearch ... />
      <AppFilterTabs ... />
      <div className="ml-auto"><Button>Nuevo</Button></div>
    </div>
  }
  // ...resto
  footer={<AppPagination ... />}  // slot al fondo
/>
```

Así **no hay que construir la barra en cada página** — se pasa como children del DataTable.

---

## Fase 3 — Rediseño página por página

### Prioridad de ataque (orden sugerido):
1. **Directorio (Clientes)** — más usado, más impacto
2. **Deals** — ya tiene tabs de status, agregar search + paginación
3. **Servicios** — catálogo, candidato ideal para vista grid/card alternativa
4. **Proyectos** — lógica similar a deals
5. **Plantillas (Briefs)** — más simple
6. **Mi Red** — UI diferente (no es tabla típica)

---

### 3.1 Directorio (Clientes)
**Problemas actuales:** sin búsqueda, sin filtros, tabla con pocas columnas útiles, sin vista de detalle de cliente.

**Mejoras:**
- `AppSearch` para buscar por nombre/email
- `AppFilterTabs`: Todos | Persona | Empresa
- Columna de "Deals activos" con badge numérico
- Fila clickeable → slide-over (Sheet) con detalle del cliente, sus deals y proyectos
- Empty state contextual con CTA "Agrega tu primer cliente"
- Ordenamiento por nombre, fecha de creación

**Columnas propuestas:**
```
[Avatar + Nombre + email] [Tipo] [País] [Deals activos] [Desde] [···]
```

---

### 3.2 Deals
**Problemas actuales:** status tabs OK, pero sin búsqueda por nombre, sin filtro por cliente, sin rango de fechas, sin totales por status visibles.

**Mejoras:**
- `AppSearch` para buscar por nombre de deal o cliente
- Mantener tabs de status + agregar conteo por status (badge)
- Estadísticas rápidas arriba (total pipeline, won, lost) — 3 mini-cards
- Columna de "Cotización aprobada" con monto
- Vista Kanban como alternativa a la tabla (toggle)

**Columnas propuestas:**
```
[Nombre deal + cliente] [Status badge] [Cotización seleccionada] [Total] [Fecha] [···]
```

---

### 3.3 Servicios
**Problemas actuales:** tabla plana, no hay forma de ver el catálogo visualmente, no hay filtro por categoría.

**Mejoras:**
- Toggle tabla/grid (cards visuales con imagen del servicio)
- `AppSearch` + filtro por categoría + filtro por tipo de cobro
- Card de servicio muestra precio, tipo, descripción corta
- Toggle activo/inactivo directamente en la tabla (switch)
- Empty state con CTA de ejemplo "Crea tu primer servicio"

**Columnas propuestas (tabla):**
```
[Imagen + Nombre + SKU] [Categoría] [Tipo cobro] [Precio base] [Activo toggle] [···]
```

---

### 3.4 Proyectos
**Problemas actuales:** no hay botón de creación (proyectos vienen de deals ganados), no hay búsqueda, status no es muy visible.

**Mejoras:**
- Aclarar en el empty state que los proyectos se generan al ganar un deal
- `AppSearch` por nombre de proyecto
- `AppFilterTabs`: Activos | Completados | Todos
- Columna de "Hitos cobrados / total" con progress bar
- Columna de "Colaboradores" con avatares apilados
- Click → página de detalle del proyecto (ya existe)

**Columnas propuestas:**
```
[Nombre + cliente] [Status] [Progreso hitos] [Colaboradores] [Fecha inicio] [···]
```

---

### 3.5 Plantillas (Briefs)
**Problemas actuales:** funciona bien, tabla sencilla, pero falta búsqueda y el empty state podría mejorar.

**Mejoras:**
- `AppSearch`
- Toggle activo/inactivo directo en la tabla
- Preview rápido del brief en un Sheet al hacer click
- Contador de preguntas más visible

---

### 3.6 Mi Red (Conexiones)
**UI diferente — no aplica tabla típica.**

**Problemas actuales:** lista plana, no hay distinción clara entre conexiones activas y pendientes, QR/link de invitación enterrado en un dialog.

**Mejoras:**
- Layout de dos columnas: [Conexiones activas] | [Invitaciones pendientes]
- Cards por conexión con avatar, nombre workspace, fecha conexión, deals compartidos
- Botón "Invitar" prominente con opciones: por email o generar link/QR
- Empty state con explicación de qué es la red y qué ganas
- Status badges: Activo | Pendiente | Rechazado

---

## Resumen de trabajo ordenado

```
BACKEND (prerequisito para todo)
├── common/dto/pagination-query.dto.ts      [nuevo]
├── clients: agregar paginación + search    [modify]
├── services: agregar paginación + search   [modify]
├── deals: agregar paginación + search      [modify]
├── projects: agregar paginación + search   [modify]
└── brief-templates: paginación + search    [modify]

FRONTEND — infraestructura (prerequisito para páginas)
├── hooks/use-list-state.ts                 [nuevo]
├── components/common/AppSearch.tsx         [nuevo]
├── components/common/AppPagination.tsx     [nuevo]
├── components/common/AppFilterTabs.tsx     [nuevo]
├── components/common/DataTable.tsx         [modificar: toolbar + footer slots]
└── hooks/use-*.ts (todos)                  [modificar: aceptar params paginados]

FRONTEND — páginas (en orden)
├── dashboard/clients/page.tsx              [rediseño completo]
├── dashboard/deals/page.tsx                [mejoras sobre lo existente]
├── dashboard/services/page.tsx             [rediseño + toggle grid/table]
├── dashboard/projects/page.tsx             [mejoras]
├── dashboard/templates/briefs/page.tsx     [mejoras menores]
└── dashboard/network/page.tsx              [rediseño completo, layout diferente]
```

## Notas de decisiones de arquitectura

1. **Paginación client-side vs server-side**: con pocos registros (freelancer = decenas de clientes, no miles) se podría hacer client-side filter/sort con todos los datos ya cargados. Pero construir server-side desde ahora es más escalable. Recomendado: **server-side desde el inicio**.

2. **DataTable toolbar slot**: mejor que crear un wrapper `DataTableWithToolbar` separado. Mantiene un único componente con API limpia.

3. **useListState genérico**: evita re-inventar debounce + reset de página + sync de filtros en cada módulo. Un hook = una fuente de verdad.

4. **Vista grid/table toggle**: guardar preferencia en `localStorage` por módulo.

5. **Deals Kanban**: es un bonus, no blocker. Implementar tabla primero.
