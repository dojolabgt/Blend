# Blend — Implementation Plan
> Plataforma de cobros, cotizaciones y servicios para freelancers en Guatemala
> Stack: NestJS + PostgreSQL + TypeORM + Recurrente

---

## El negocio en una línea

Blend cobra suscripción a freelancers. Los freelancers cobran a sus clientes usando su propia cuenta Recurrente conectada a Blend. Los freelancers pueden colaborar entre sí con registro de reparto de ganancias.

---

## Roles

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Dueño del SaaS — acceso total |
| `SUPPORT` | Soporte — acceso limitado a perfiles y estados |
| `FREELANCER` | Usuario principal |
| `CLIENT` | Cliente del freelancer — dashboard read-only |

---

## Fase 0 — Fundación
> No construyas ningún feature hasta que esto esté resuelto.

### Infraestructura base
- Renombrar rol `USER` a `FREELANCER`, eliminar `TEAM`, agregar `CLIENT` y `SUPPORT`
- Migrations configuradas correctamente, sin `synchronize: true`
- Interceptor global de errores con formato consistente
- Logger estructurado (no `console.log`)
- Swagger habilitado desde el inicio
- `.env.example` completo y actualizado

### Variables de entorno nuevas
```
ENCRYPTION_KEY                # AES-256 para keys de Recurrente
BLEND_RECURRENTE_PUBLIC_KEY   # Keys propias de Blend para cobrar suscripciones
BLEND_RECURRENTE_SECRET_KEY
```

### Utilidades core
- `EncryptionService` — AES-256. Usado para API keys de Recurrente
- `TokenService` — generar y validar tokens con expiración (invitaciones, public tokens)
- `PaginationDto` — estandarizar paginación en todos los listados
- `ApiResponseInterceptor` — formato de respuesta consistente en toda la API

### FreelancerProfile
```
FreelancerProfile
  - id
  - userId (OneToOne)
  - businessName, logo, brandColor
  - recurrentePublicKey  (encriptado)
  - recurrentePrivateKey (encriptado)
  - plan: free | pro
  - planExpiresAt
  - quotesThisMonth
  - quotesMonthReset
  - isActive
  - createdAt, updatedAt
```
- `register()` crea FreelancerProfile automáticamente
- `GET /me/profile` y `PATCH /me/profile`
- `PATCH /me/recurrente-keys` — guarda keys encriptadas, nunca se devuelven en texto plano
- `GET /me/recurrente-status` — indica si las keys están configuradas, sin exponerlas

### Migración inicial
- Alterar enum de roles
- Crear tabla `freelancer_profiles`

---

## Fase 1 — Servicios y Clientes

### Services
```
Service
  - id, freelancerId
  - name, description
  - defaultPrice, currency (GTQ | USD)
  - category, isActive
  - createdAt, updatedAt
```
- `GET /services` con filtros por categoría e isActive
- `POST /services`
- `GET /services/:id`
- `PATCH /services/:id`
- `DELETE /services/:id` — soft delete si tiene quotes asociadas

### Clients
```
Client
  - id, freelancerId
  - linkedUserId (nullable)
  - name, email, whatsapp, notes
  - inviteToken (nullable), inviteExpiresAt
  - inviteStatus: pending | accepted | null
  - createdAt, updatedAt
```
- `GET /clients` con paginación y búsqueda
- `POST /clients`
- `GET /clients/:id`
- `PATCH /clients/:id`
- `DELETE /clients/:id` — soft delete
- `GET /clients/:id/history` — cotizaciones + pagos del cliente
- `POST /clients/:id/invite` — genera token, envía email con link de registro

### Flujos de registro de clientes
- **Invitado:** recibe email con link `/register?clientToken=xxx` → se registra → linkedUserId se conecta automáticamente
- **Auto-registro:** se registra como CLIENT → puede vincularse después si el freelancer lo agrega

### LimitsGuard
```
free → 5 clientes, 10 cotizaciones/mes
pro  → ilimitado
```
Cron job mensual para reset de `quotesThisMonth`.

---

## Fase 2 — Cotizaciones y PDF

### Quotes
```
Quote
  - id, freelancerId, clientId
  - status: draft | sent | accepted | rejected | expired
  - validUntil, notes, internalNotes, currency
  - subtotal, taxPercent, taxAmount, total
  - publicToken (uso único, para aceptar sin login)
  - sentAt, acceptedAt, rejectedAt
  - createdAt, updatedAt

QuoteItem
  - id, quoteId, serviceId (nullable)
  - description, quantity, unitPrice, total, order
```
- `GET /quotes` con filtros por status, cliente, fecha
- `POST /quotes`
- `GET /quotes/:id`
- `PATCH /quotes/:id` — solo en status draft
- `DELETE /quotes/:id` — solo en status draft
- `POST /quotes/:id/send` — status = sent, genera publicToken, envía email
- `POST /quotes/:id/accept` — autenticado, desde dashboard del cliente
- `POST /quotes/:id/reject` — autenticado
- `POST /public/quotes/:token/accept` — sin auth, desde link en email
- `POST /public/quotes/:token/reject` — sin auth
- `GET /public/quotes/:token` — ver cotización sin login
- `GET /quotes/:id/pdf` — requiere auth del freelancer
- `GET /public/quotes/:token/pdf` — descarga sin login

### PDF
- Template HTML con logo, colores de marca, items, subtotal, impuestos, total
- Generado con puppeteer o pdfmake
- Cron job diario para expirar quotes vencidas

---

## Fase 3 — Pagos con Recurrente

### RecurrenteModule (wrapper interno)
- Recibe `freelancerId`, desencripta keys en memoria
- Incluye `metadata: { freelancerId, paymentId, context: freelancer_payment }` en todos los checkouts
- Maneja errores de la API con mensajes claros

### Payments
```
Payment
  - id, freelancerId, clientId, quoteId (nullable)
  - recurrenteCheckoutId, recurrenteCheckoutUrl
  - amount, currency
  - status: pending | paid | failed | refunded
  - dueDate, paidAt, reminderSentAt
  - createdAt, updatedAt
```
- `GET /payments` con filtros por status, cliente, fecha
- `POST /payments` — crea Payment + genera checkout en Recurrente
- `GET /payments/:id`
- `PATCH /payments/:id` — solo campos internos
- `POST /payments/:id/send` — envía link de pago por email
- `POST /payments/:id/remind` — reenvía recordatorio (pro only)

### Webhook
- `POST /webhooks/recurrente` — público, sin auth JWT
- Verificar firma con `RECURRENTE_WEBHOOK_SECRET`
- Leer `metadata.context` para distinguir tipo de evento
- Actualizar `Payment.status` y notificar al freelancer
- Loggear todos los webhooks recibidos para auditoría

---

## Fase 4 — Colaboración entre Freelancers

### FreelancerConnection
```
FreelancerConnection
  - id, ownerId, collaboratorId
  - inviteToken, inviteExpiresAt
  - status: pending | active | paused
  - createdAt, updatedAt
```
- `POST /connections/invite`
- `POST /connections/accept`
- `GET /connections`
- `GET /connections/received`
- `PATCH /connections/:id`
- `DELETE /connections/:id`

### CollaborationAssignment
```
CollaborationAssignment
  - id, connectionId, paymentId
  - ownerId, collaboratorId
  - revenuePercent
  - ownerAmount, collaboratorAmount (calculados al crear)
  - status: assigned | completed
  - notes, createdAt, updatedAt
```
- `POST /payments/:id/assign`
- `GET /assignments`
- `GET /assignments/received`
- `PATCH /assignments/:id` — solo si status = assigned
- `POST /assignments/:id/complete`

### Reglas de negocio
- Solo se puede asignar a freelancers con conexión activa
- No se puede asignar más del 100% en total por pago
- El cobro al cliente lo maneja el dueño, sin cambios en Recurrente
- Blend muestra el desglose: "De Q1,000 → Tú recibes Q700, Colaborador recibe Q300"

---

## Fase 5 — Billing (Blend cobra al freelancer)
> Blend usa sus propias keys de Recurrente, no las del freelancer.

### BillingService
- `subscribe(freelancerId, interval: month | year)`
- `cancelSubscription(freelancerId)`
- `handleWebhook(event)`

### Endpoints
- `GET /billing/status`
- `POST /billing/subscribe`
- `POST /billing/cancel`
- `GET /billing/history`

### Webhook de billing
- `POST /webhooks/recurrente/billing` — endpoint separado
- `paid` → plan = pro, actualizar planExpiresAt
- `past_due` → notificar, grace period de 3 días
- `cancelled` → plan = free
- `unable_to_start` → notificar, no activar pro

---

## Fase 6 — Dashboard del Freelancer

```
GET /dashboard/summary
  pendingPayments: { count, total }
  paidThisMonth: { count, total }
  overduePayments: { count, total }
  pendingQuotes: { count }
  acceptedQuotesThisMonth: { count, total }
  topClients: [{ name, totalPaid }]
  topServices: [{ name, timesUsed, totalBilled }]
  collaboratorsSummary: [{ name, assignedCount, pendingAmount }]
  planStatus: { plan, quotesThisMonth, quotesLimit, renewsAt }
```

---

## Fase 7 — Dashboard del Cliente

- `GET /client/quotes` con filtros
- `GET /client/quotes/:id`
- `POST /client/quotes/:id/accept`
- `POST /client/quotes/:id/reject`
- `GET /client/payments`
- `GET /client/payments/:id` con link de pago si está pendiente

---

## Fase 8 — Admin Panel

### Roles
- `ADMIN` — acceso total
- `SUPPORT` — solo lectura de perfiles, clientes y estados. Sin métricas financieras.

### Métricas (ADMIN only)
```
GET /admin/metrics
  mrr, arr
  activeFreelancers
  newFreelancersThisMonth
  churnThisMonth, churnRate
  freeVsPro: { free, pro }
  conversionRate
  totalVolumeProcessed
  quotesGeneratedThisMonth
  avgPaymentsPerFreelancer
```

### Definiciones de negocio
- **Churn:** cancelación de suscripción pro
- **Freelancer activo:** al menos 1 pago o cotización en los últimos 30 días
- **Volumen procesado:** suma de Payment.amount donde status = paid en la DB de Blend

### Gestión (ADMIN + SUPPORT)
- `GET /admin/freelancers` con búsqueda y filtros
- `GET /admin/freelancers/:id`
- `GET /admin/freelancers/:id/payments`
- `GET /admin/freelancers/:id/billing`

### Acciones (ADMIN only)
- `PATCH /admin/freelancers/:id/plan`
- `PATCH /admin/freelancers/:id/suspend`
- `PATCH /admin/freelancers/:id/activate`
- `POST /admin/support-users`
- `DELETE /admin/support-users/:id`

---

## Fase 0.5: Refactor Core y Preparación Multi-Tenant (✓ Completada)
**Objetivo:** Adaptar el código base a un entorno robusto, tipado y multi-rol para soportar la escalabilidad.

- [x] Unificar enums (`UserRole`) y centralizar tipos.
- [x] Crear interceptares robustos (unwrap de `ApiResponse<T>`).
- [x] Reconstruir la arquitectura de rutas en Next.js usando *Route Groups* (`(admin)`, `(freelancer)`, `(client)`).
- [x] Extraer layouts compartidos (`DashboardShell`, `Sidebar`) independientes de rol.
- [x] Crear el servicio base del backend para Perfiles de Freelancer con encripción de claves.

## Fase 1: Perfiles Freelancer y Gestión de Usuarios Avanzada (🔄 En Progreso)
**Objetivo:** Reconstruir el frontend desde cero (`frontend-app`) e integrar las funciones base del Multi-tenant.

**Backend (✓ Listo):**
- Módulos `users` y `freelancer-profile` con encriptación AES-256-GCM.
- Endpoints CRUD para usuarios y actualización de claves Recurrente.

**Frontend (frontend-app):**
- Setup limpio de Next.js, Shadcn y Tailwind.
- Portar lógica base (Tipos, Interceptores, Contexto de Auth).
- **Perfil del Freelancer**: Formularios de perfil básico y almacenamiento seguro de claves Recurrente (Pública/Privada) conectando con el endpoint `/me/recurrente-keys`.
- **Panel de Admin**: Tabla y diálogos completos de gestión de Usuarios.

---

## Fase 9 — Notificaciones y Automatizaciones

### Emails transaccionales (todos los planes)
- Registro y verificación de email
- Invitación de cliente
- Cotización enviada al cliente
- Cotización aceptada/rechazada (al freelancer)
- Pago recibido (al freelancer)
- Link de pago al cliente
- Invitación de colaboración entre freelancers
- Alerta de plan past_due

### Automatizaciones (pro only)
- Recordatorio automático de pago (3, 7, 14 días después del vencimiento)
- Alerta de cotización por vencer (2 días antes de validUntil)
- Resumen semanal al freelancer

### Cron jobs
- Reset mensual de quotesThisMonth
- Expiración diaria de quotes vencidas
- Expiración de tokens de invitación
- Envío de recordatorios automáticos

---

## Arquitectura de webhooks

Checkouts de flujo freelancer→cliente:
```json
{ "freelancerId": "uuid", "paymentId": "uuid", "context": "freelancer_payment" }
```

Checkouts de billing de Blend:
```json
{ "freelancerId": "uuid", "context": "blend_billing" }
```

El router de webhooks lee `context` y delega al handler correcto. Todos los eventos se loggean en DB para auditoría.

---

## Seguridad

- API keys encriptadas AES-256, desencriptadas solo en memoria, nunca en logs ni respuestas
- Tokens públicos firmados con expiración y uso único donde aplique
- Rate limiting en endpoints públicos
- Validación de firma en todos los webhooks de Recurrente
- Guards de ownership — un freelancer no puede ver datos de otro
- SUPPORT no puede ver métricas financieras ni modificar planes

---

## Orden de ejecución

```
0. Fundación        → Roles, FreelancerProfile, utilidades core, infraestructura
1. Servicios        → Services + Clients + flujos de invitación + LimitsGuard
2. Cotizaciones     → Quotes + PDF + flujo de aprobación dual
3. Pagos            → RecurrenteModule + Payments + webhooks
4. Colaboración     → Connections + Assignments
5. Billing          → Blend cobra al freelancer + webhooks de billing
6. Dashboard FR     → Resumen del freelancer
7. Dashboard Client → Vista del cliente
8. Admin Panel      → Métricas + gestión + roles de soporte
9. Automatizaciones → Emails + recordatorios + cron jobs
```

No avanzar a la siguiente fase hasta que la anterior tenga sus endpoints funcionando y los casos edge principales cubiertos.