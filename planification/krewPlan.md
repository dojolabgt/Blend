# Blend — Implementation Plan

> **Plataforma de cobros, cotizaciones y servicios para agencias y freelancers en Centroamérica**
>
> Stack: NestJS + PostgreSQL + TypeORM + Recurrente

---

## El negocio en una línea

Blend cobra suscripción a los espacios de trabajo (Workspaces). Los usuarios cobran a sus clientes usando su propia cuenta Recurrente conectada a su Workspace en Blend. Los profesionales pueden invitar a colaboradores a sus espacios para trabajar juntos y repartir ganancias.

---
## Roles y Permisos

### Roles de Aplicación (Globales) 

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Dueño del SaaS — acceso total |
| `SUPPORT` | Soporte — acceso limitado a workspaces y estados |
| `USER` | Usuario principal (Freelancer/Agencia) |
| `CLIENT` | Cliente final — dashboard read-only |

### Roles de Workspace (Locales)

| Rol | Descripción |
|-----|-------------|
| `OWNER` | Dueño del Workspace (El que paga y administra claves) |
| `COLLABORATOR` | Miembro del equipo (Ej. diseñador junior de la agencia) |
| `GUEST` | Colaborador externo invitado por Magic Token a un proyecto/cobro |

---

## Fase 0 — Fundación: Arquitectura Multi-Tenant ✅

> ⚠️ No construyas ningún feature hasta que esto esté resuelto.

### Infraestructura base

- Configuración de roles globales y locales
- Migrations configuradas correctamente, sin `synchronize: true`
- Interceptor global de errores con formato consistente
- Logger estructurado (no `console.log`)
- Swagger habilitado desde el inicio
- `.env.example` completo y actualizado

### Utilidades core

- `EncryptionService` — AES-256-GCM. Usado para API keys de Recurrente
- `TokenService` — generar y validar tokens con expiración (invitaciones, public tokens)
- `PaginationDto` — estandarizar paginación en todos los listados
- `ApiResponseInterceptor` — formato de respuesta consistente

### Workspaces (El Tenant Principal)

```
Workspace
  - id
  - businessName, logo, brandColor
  - recurrentePublicKey  (encriptado)
  - recurrentePrivateKey (encriptado)
  - plan: free | pro | premium
  - planExpiresAt
  - quotesThisMonth, quotesMonthReset
  - isActive
  - createdAt, updatedAt

WorkspaceMember
  - id
  - userId
  - workspaceId
  - role: owner | collaborator | guest
```

- `register()` crea el User, genera un Workspace por defecto y crea el WorkspaceMember con rol `OWNER`.
- **Regla de Negocio:** Un usuario solo puede ser `OWNER` de 1 Workspace (su negocio principal), pero puede ser `COLLABORATOR` o `GUEST` en múltiples Workspaces de terceros.

**Endpoints:**
- `GET /workspaces` — Devuelve los workspaces a los que pertenece el usuario.
- `PATCH /workspaces/:id` — Actualiza branding (Solo OWNER).
- `PATCH /workspaces/:id/recurrente-keys` — Guarda keys encriptadas.
- **Guard/Interceptor `x-workspace-id`:** Inyecta el tenant en todas las peticiones para aislar datos.

---

## Fase 1 — Servicios y Clientes ✅

### Services

```
Service
  - id, workspaceId
  - name, description
  - defaultPrice, currency (GTQ | USD)
  - category, isActive
  - createdAt, updatedAt
```

- CRUD estándar protegido por el `WorkspaceGuard`. Filtrado automático por `workspaceId`.
- `DELETE /services/:id` — soft delete si tiene quotes asociadas.

### Clients

```
Client
  - id, workspaceId
  - linkedUserId (nullable, por si el cliente crea cuenta)
  - name, email, whatsapp, notes
  - inviteToken (nullable), inviteExpiresAt
  - inviteStatus: pending | accepted | null
  - createdAt, updatedAt
```

- `GET /clients/:id/history` — cotizaciones + pagos del cliente en ese workspace.
- `POST /clients/:id/invite` — genera token, envía email con link de registro.

### LimitsGuard (Por Workspace)

| Plan | Límites |
|------|---------|
| `free` | 5 clientes, 10 cotizaciones/mes |
| `pro` | Clientes ilimitados, 500 cotizaciones/mes |
| `premium` | Ilimitado + módulos extra + colaboradores |

- Cron job mensual para reset de `quotesThisMonth` en la tabla Workspaces.

---

## Fase 2 — Negociación: Deals, Briefs y Cotizaciones ✅

> **Evolución:** Lo que antes eran simples "Cotizaciones" evolucionó a un flujo de **Tratos (Deals)**. 
> Ahora un Deal es el contenedor principal que guía al cliente por pasos: 
> 1. **Brief:** Captura de requerimientos vía formulario dinámico (Brief Forms).
> 2. **Servicios:** Selección de lo que se va a ofrecer.
> 3. **Cotización:** Propuesta económica (con soporte para múltiples opciones A/B).
> 4. **Plan de Pagos:** Definición de hitos (Anticipo, Finalización, etc).

### Entidades de Negociación

**Deal**
  - id, workspaceId, clientId
  - status: `draft` | `sent` | `won` | `lost`
  - name, slug, publicToken (para acceso del cliente)
  - currentStep: `brief` | `services` | `quotation` | `payment_plan`
  - proposalIntro, proposalTerms, validUntil

**Brief** (Respuestas)
  - id, dealId, templateId
  - responses: JSON con las respuestas del cliente
  - isCompleted: true/false

**Quotation** (Opciones)
  - id, dealId, optionName, description, currency
  - subtotal, discount, taxTotal, total
  - isApproved: Solo una por Deal (la que el cliente acepta)

**PaymentPlan & Milestones**
  - Hitos de pago vinculados a la cotización aprobada.
  - Milestones: `name`, `percentage`, `amount`, `status`, `dueDate`.

**Logros:**
- [x] Motor de Briefs dinámicos y plantillas (Brief Builder).
- [x] Flujo de creación de Deal tipo Wizard.
- [x] Vista pública de Propuesta Comercial (Acceso vía Magic Token).
- [x] Selección y Aceptación de cotización por parte del cliente.

---

## Fase 3 — Pagos con Recurrente 🚧

> **Estado:** Estructura de datos lista (PaymentPlan/Milestones). Pendiente integración final de checkout dinámico.

### RecurrenteModule (wrapper interno)

- Recibe `workspaceId`, busca el Workspace y desencripta keys en memoria.
- Incluye metadata: `{ workspaceId, paymentId, context: blend_payment }` en los checkouts.

### Payments

```
Payment
  - id, workspaceId, clientId, quoteId (nullable)
  - recurrenteCheckoutId, recurrenteCheckoutUrl
  - amount, currency
  - status: pending | paid | failed | refunded
  - dueDate, paidAt, reminderSentAt
```

- `POST /payments` — crea Payment local + genera checkout en Recurrente.
- `POST /payments/:id/remind` — reenvía recordatorio (solo pro/premium).

### Webhook

- `POST /webhooks/recurrente` — Endpoint público para Recurrente.
  - Verificar firma con `RECURRENTE_WEBHOOK_SECRET`.
  - Leer `metadata.context` y `metadata.workspaceId`.
  - Actualizar `Payment.status`.

---

## Fase 4 — Conexiones entre Workspaces y Colaboración (Red / Network) ✅

Blend permite que múltiples agencias y freelancers (Workspaces) operen bajo un esquema de invitaciones. En lugar de usuarios "invitados" per se, el sistema une Workspaces enteros a través de `WorkspaceConnection`.

### Reglas de Colaboración y Permisos en Proposals (Deals)
Para mantener un SaaS escalable y justo, la propiedad de los Deals funciona bajo el siguiente modelo:

1. **Dueño del Deal (Owner Workspace):**
   - El Deal le pertenece siempre al Workspace que generó la cotización.
   - **Marca y Catálogo:** Todos los correos enviados, el logo de la propuesta, términos y condiciones, y la lista de "Servicios" provienen del Workspace Dueño.
   - **Límites de Cuota:** Invitar colaboradores a tu Deal no consume tus cuotas (Si eres Pro, es ilimitado). Si el dueño es Free, se restringe a las cuotas del Free.

2. **Roles de Colaboradores (Invitados Externos):**
   - **Viewer:** El colaborador solo puede ver la cotización y el estado de pagos/hitos. No puede editar.
   - **Editor:** Puede agregar etapas al Brief y modificar opciones de cotización, trabajando "a nombre de" la agencia dueña.
   - **Transfer (Futuro):** Permite ceder la propiedad de un Deal por completo a otro Workspace.

3. **Restricciones del Plan Free en la Red:**
   - Un usuario Free **no puede** enviar correos masivos de invitación ni generar Links QR públicos.
   - Sin embargo, un usuario Free **SÍ PUEDE** aceptar invitaciones entrantes e invitar a sus Conexiones Activas existentes a colaborar en sus propios Deals. Esto fomenta el "Word of mouth" sin otorgarles herramientas de red masivas.

### Milestones Splits (Reparto de Ingresos)
- `MilestoneSplit`: Cuando un hito del PaymentPlan es pagado, el dueño puede definir un sub-porcentaje o monto fijo de ese hito para que vaya directamente al Workspace Colaborador.
- **Flujo:** El pago principal entra a la tarjeta del Dueño, pero la UI muestra de forma transparente la retención o deuda hacia el Colaborador.

---

## Fase 5 — Billing (Blend cobra al SaaS) ✅

> Blend usa sus propias keys maestras de Recurrente, no las del usuario.

### BillingSubscription

```
BillingSubscription
  - id, workspaceId
  - recurrenteCheckoutId, recurrenteSubscriptionId
  - plan: pro | premium
  - status, currentPeriodStart, currentPeriodEnd
```

- `POST /billing/subscribe` — Genera checkout de suscripción de Blend.
- `POST /webhooks/recurrente/billing` — Escucha pagos de suscripción y actualiza el plan del Workspace.

---

## Fase 6 — Dashboard del Workspace

**`GET /workspaces/:id/summary`**

```json
{
  "pendingPayments": { "count": 0, "total": 0 },
  "paidThisMonth": { "count": 0, "total": 0 },
  "pendingQuotes": { "count": 0 },
  "topClients": [{ "name": "", "totalPaid": 0 }],
  "teamSummary": [{ "name": "", "role": "", "assignedAmount": 0 }],
  "planStatus": { "plan": "", "quotesThisMonth": 0, "renewsAt": "" }
}
```

---

## Fase 7 — Dashboard del Cliente

- Vista Read-Only de Quotes y Payments donde el email del cliente coincida.
- Acceso a botones directos de pago de Recurrente.

---

## Fase 8 — Admin Panel (SuperAdmin)

### Métricas SaaS

- MRR, ARR, Workspaces Activos (Por plan: Free, Pro, Premium)
- Churn Rate, Volumen procesado global

### Gestión

- `GET /admin/workspaces` — Ver todos los negocios registrados.
- `PATCH /admin/workspaces/:id/plan` — Upgrade/Downgrade manual.
- `PATCH /admin/users/:id/suspend` — Banear usuarios problemáticos.

---
## Fase 0.5: Refactor Multi-Tenant ✅

### Backend
- [x] Eliminar `FreelancerProfile`.
- [x] Crear `Workspace` y tabla pivote `WorkspaceMember`.
- [x] Actualizar Auth (`register`) para que cree el Usuario y su Workspace nativo en 1 transacción.
- [x] Crear Guard/Interceptor `x-workspace-id`.

### Frontend
- [x] `AuthContext` ahora maneja `activeWorkspaceId`.
- [x] Cliente API inyecta header `x-workspace-id` automáticamente.
- [x] UI limpia: Ocultar selector de Workspaces si el usuario solo pertenece a 1 (su propio negocio).

---

## Fase 9 — Notificaciones y Automatizaciones

### Emails transaccionales

- Invitaciones a colaborar en un Workspace
- Cotización enviada / Link de pago generado
- Comprobante de pago (Recibo interno de Blend)

### Automatizaciones (Pro/Premium)

- Módulo n8n / Zapier vía Webhooks expuestos por Blend
- Recordatorios de pago a los 3 y 7 días de vencimiento

---

## Orden de Ejecución Recomendado

| # | Fase | Descripción |
|---|------|-------------|
| 0 | Fundación | Refactor Multi-tenant, Auth, Workspaces, Guardias ✅ |
| 1 | Servicios | CRUD ✅ |
| 2 | Negociación | Deals + Briefs + Propuestas + Estructura de Cobro ✅ |
| 3 | Pagos | Checkout dinámico de hitos + integraciones Recurrente 🚧 |
| 4 | Colaboración | Invitaciones + CollaborationSplit ✅ |
| 5 | Billing | Blend cobra suscripción al Workspace ✅ |
| 6 | Dashboard FR | Resumen del Workspace |
| 7 | Dashboard Client | Vista del cliente |
| 8 | Admin Panel | Métricas + gestión |
| 9 | Automatizaciones | Emails + n8n webhooks + recordatorios |
```