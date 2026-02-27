# Subscriptions

Las suscripciones te permiten crear pagos recurrentes. Puedes cobrar semanal, mensual, o anualmente. O puedes elegir un período más específico, como "cada 2 meses". Una vez el usuario empiece su suscripción, se le cobrará recurrentemente en el intervalo seleccionado.

## Status de una suscripción

| Status | Descripción |
|--------|-------------|
| `active` | La suscripción está activa y los pagos están al día. |
| `paused` | La suscripción fue pausada por el comercio o el usuario. No se cobrará hasta que el estado vuelva a `active`. |
| `past_due` | El período está vencido y no se ha logrado cobrar el último pago. Se hacen 3 re-intentos automáticos en los siguientes 5 días. Si se cobra → `active`. Si no → `cancelled`. |
| `cancelled` | La suscripción fue cancelada. Ya no se harán intentos de cobro. |
| `unable_to_start` | El primer pago falló y no es posible activar la suscripción. |

---

## GET /api/subscriptions/:subscriptionId

Obtiene una suscripción específica.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Ejemplo de solicitud**

```bash
curl --location -g 'https://app.recurrente.com/api/subscriptions/{{subscriptionId}}' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}'
```

**Respuesta exitosa `200 OK`**

```json
{
  "id": "su_nehndm7j",
  "description": "One Free-Testable Banana",
  "status": "active",
  "created_at": "2024-03-01T03:52:12.636-06:00",
  "updated_at": "2024-03-01T03:52:12.982-06:00",
  "current_period_start": "2024-03-01T03:52:12.636-06:00",
  "current_period_end": "2024-03-02T03:52:12.636-06:00",
  "tax_name": null,
  "tax_id": null,
  "subscriber": {
    "id": "us_rdctav2g",
    "first_name": "Fela",
    "last_name": "Kuti",
    "full_name": "Fela Kuti",
    "email": "test@user.com",
    "phone_number": null
  },
  "checkout": {
    "id": "ch_lmgbvesmihkqzma3"
  },
  "product": {
    "id": "pr_7ehozftv"
  }
}
```

---

## GET /api/subscriptions

Obtiene todas las suscripciones. Por defecto muestra las 10 más recientes. Para paginar, usa el query param `page`.

**Ejemplo:** `https://app.recurrente.com/api/subscriptions?page=2`

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Ejemplo de solicitud**

```bash
curl --location 'https://app.recurrente.com/api/subscriptions' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}'
```

**Respuesta exitosa `200 OK`**

```json
[
  {
    "id": "su_nehndm7j",
    "description": "One Free-Testable Banana",
    "status": "active",
    "created_at": "2024-03-01T03:52:12.636-06:00",
    "updated_at": "2024-03-01T03:52:12.982-06:00",
    "current_period_start": "2024-03-01T03:52:12.636-06:00",
    "current_period_end": "2024-03-02T03:52:12.636-06:00",
    "tax_name": null,
    "tax_id": null,
    "subscriber": {
      "id": "us_rdctav2g",
      "first_name": "Fela",
      "last_name": "Kuti",
      "full_name": "Fela Kuti",
      "email": "test@user.com",
      "phone_number": null
    },
    "checkout": { "id": "ch_lmgbvesmihkqzma3" },
    "product": { "id": "pr_7ehozftv" }
  }
]
```

---

## PATCH /api/subscriptions/:subscriptionId

Pausa o reanuda una suscripción.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Body (form-data)**

| Campo | Valores posibles | Descripción |
|-------|------------------|-------------|
| `act` | `pause` \| `unpause` | Acción a realizar |

**Ejemplo de solicitud**

```bash
curl --location -g --request PATCH 'https://app.recurrente.com/api/subscriptions/{{subscriptionId}}' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}' \
--form 'act=pause'
```

**Respuesta exitosa `200 OK`**

```json
{
  "id": "su_nehndm7j",
  "description": "One Free-Testable Banana",
  "status": "paused",
  "created_at": "2024-03-01T03:52:12.636-06:00",
  "updated_at": "2024-03-01T03:52:12.982-06:00",
  "current_period_start": "2024-03-01T03:52:12.636-06:00",
  "current_period_end": "2024-03-02T03:52:12.636-06:00",
  "tax_name": null,
  "tax_id": null,
  "subscriber": {
    "id": "us_rdctav2g",
    "first_name": "Fela",
    "last_name": "Kuti",
    "full_name": "Fela Kuti",
    "email": "test@user.com",
    "phone_number": null
  },
  "checkout": { "id": "ch_lmgbvesmihkqzma3" },
  "product": { "id": "pr_7ehozftv" }
}
```

---

## DELETE /api/subscriptions/:subscriptionId

Cancela una suscripción.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Ejemplo de solicitud**

```bash
curl --location -g --request DELETE 'https://app.recurrente.com/api/subscriptions/{{subscriptionId}}' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}'
```

**Respuesta exitosa `200 OK`**

```json
{
  "message": "Suscripción cancelada"
}
```