# Checkouts

Los checkouts representan sesiones de pago. Puedes crearlos con detalles de items directamente, con un Product ID, o con configuración de suscripción.

---

## POST /api/checkouts/ — Pago único (item details)

Crea un checkout para un pago único especificando los detalles del item directamente.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Body (JSON)**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `items[][name]` | string | ✅ | Nombre del producto. |
| `items[][currency]` | string | ✅ | Moneda: `GTQ` o `USD`. |
| `items[][amount_in_cents]` | integer | ✅ | Monto en centavos. |
| `items[][image_url]` | string | Opcional | URL de la imagen del producto. |
| `items[][quantity]` | integer | Opcional | Cantidad (1–9). Default: `1`. |
| `items[][has_dynamic_pricing]` | boolean | Opcional | Precio dinámico (solo pagos únicos). El precio se convierte en el monto neto a recibir. |
| `success_url` | string | Opcional | URL de redirección tras pago exitoso. |
| `cancel_url` | string | Opcional | URL de redirección al abandonar el checkout. |
| `user_id` | string | Opcional | ID del usuario. Prepopula los campos del formulario. |
| `metadata` | object | Opcional | Hasta 50 keys (40 chars nombre / 500 chars valor). |
| `expires_at` | string | Opcional | Fecha de expiración en formato ISO 8601. Ej: `"2050-05-15T13:45:30Z"`. |

**Ejemplo de solicitud**

```bash
curl --location 'https://app.recurrente.com/api/checkouts' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}' \
--header 'Content-Type: application/json' \
--data '{
  "items": [
    {
      "name": "One Ripe Banana",
      "currency": "GTQ",
      "amount_in_cents": 3000,
      "image_url": "https://source.unsplash.com/400x400/?banana",
      "quantity": 1
    }
  ],
  "success_url": "https://www.google.com",
  "cancel_url": "https://www.amazon.com",
  "user_id": "us_123456",
  "metadata": {}
}'
```

**Respuesta exitosa `201 Created`**

```json
{
  "id": "ch_eegw9j5zgqoae3ms",
  "checkout_url": "https://app.recurrente.com/checkout-session/ch_eegw9j5zgqoae3ms"
}
```

---

## POST /api/checkouts/ — Suscripción (item details)

Crea un checkout para una suscripción recurrente.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Body (JSON) — campos adicionales de suscripción**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `items[][name]` | string | ✅ | Nombre de la suscripción. |
| `items[][currency]` | string | ✅ | Moneda: `GTQ` o `USD`. |
| `items[][amount_in_cents]` | integer | ✅ | Monto en centavos. |
| `items[][charge_type]` | string | ✅ | Debe ser `"recurring"`. |
| `items[][billing_interval]` | string | ✅ | `week`, `month` o `year`. |
| `items[][billing_interval_count]` | integer | ✅ | Cantidad de intervalos por ciclo. |
| `items[][image_url]` | string | Opcional | URL de la imagen del producto. |
| `items[][periods_before_automatic_cancellation]` | integer | Opcional | Periodos a cobrar antes de cancelación automática. |
| `items[][free_trial_interval]` | string | Opcional | Intervalo de prueba: `week`, `month` o `year`. |
| `items[][free_trial_interval_count]` | integer | Opcional | Cantidad de intervalos de prueba. |
| `success_url` | string | Opcional | URL de redirección tras pago exitoso. |
| `cancel_url` | string | Opcional | URL de redirección al abandonar el checkout. |
| `user_id` | string | Opcional | ID del usuario. |
| `metadata` | object | Opcional | Información adicional estructurada. |

**Ejemplo de solicitud**

```bash
curl --location 'https://app.recurrente.com/api/checkouts' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}' \
--header 'Content-Type: application/json' \
--data '{
    "items": [
        {
            "name": "Membresia Gold",
            "description": "Suscripción con un mes de prueba",
            "currency": "GTQ",
            "amount_in_cents": 5000,
            "charge_type": "recurring",
            "image_url": "https://source.unsplash.com/400x400/?banana",
            "billing_interval_count": 1,
            "billing_interval": "month",
            "periods_before_automatic_cancellation": 12,
            "free_trial_interval_count": 1,
            "free_trial_interval": "month",
            "metadata": {}
        }
    ],
    "success_url": "https://www.google.com",
    "cancel_url": "https://www.amazon.com",
    "metadata": {}
}'
```

**Respuesta exitosa `201 Created`**

```json
{
  "id": "ch_eegw9j5zgqoae3ms",
  "checkout_url": "https://app.recurrente.com/checkout-session/ch_eegw9j5zgqoae3ms"
}
```

---

## POST /api/checkouts/ — Por Product ID

Crea un checkout a partir de un producto ya existente en Recurrente.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Body (JSON)**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `items[][product_id]` | string | ✅ | ID del producto creado previamente. |
| `success_url` | string | Opcional | URL de redirección tras pago exitoso. |
| `cancel_url` | string | Opcional | URL al abandonar el checkout. |
| `user_id` | string | Opcional | ID del usuario. |
| `metadata` | object | Opcional | Información adicional estructurada. |

**Ejemplo de solicitud**

```bash
curl --location 'https://app.recurrente.com/api/checkouts' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}' \
--header 'Content-Type: application/json' \
--data '{
  "items": [
    {
       "product_id": "prod_123456"
    }
  ],
  "metadata": {}
}'
```

**Respuesta exitosa `201 Created`**

```json
{
  "id": "ch_eegw9j5zgqoae3ms",
  "checkout_url": "https://app.recurrente.com/checkout-session/ch_eegw9j5zgqoae3ms"
}
```

---

## PATCH /api/checkouts/:checkoutId

Actualiza un checkout existente. Solo se permiten ediciones a checkouts que **no han sido pagados**.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Body (JSON)**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `success_url` | string | Opcional | Nueva URL de redirección tras pago exitoso. |
| `cancel_url` | string | Opcional | Nueva URL al abandonar el checkout. |
| `metadata` | object | Opcional | Hasta 50 keys (40 chars nombre / 500 chars valor). |
| `expires_at` | string | Opcional | Nueva fecha de expiración en ISO 8601. |

**Respuesta exitosa `201 Created`**

```json
{
  "id": "ch_eegw9j5zgqoae3ms",
  "status": "unpaid",
  "payment": null,
  "payment_method": null,
  "transfer_setups": [],
  "metadata": { "internalID": 123 },
  "expires_at": "2050-05-15T13:45:30Z",
  "success_url": "https://google.com",
  "cancel_url": "https://amazon.com",
  "created_at": "2025-05-15T13:45:30Z",
  "total_in_cents": "500",
  "currency": "GTQ",
  "latest_intent": {
    "id": "pa_123",
    "created_at": "2025-05-15T13:45:30Z",
    "type": "PaymentIntent",
    "data": { "auth_code": "123456" }
  }
}
```

---

## GET /api/checkouts/:checkoutId

Obtiene el detalle de un checkout específico.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Ejemplo de solicitud**

```bash
curl --location -g 'https://app.recurrente.com/api/checkouts/{{checkoutId}}' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}'
```

**Respuesta exitosa `200 OK`**

```json
{
  "id": "ch_eegw9j5zgqoae3ms",
  "status": "unpaid",
  "payment": null,
  "payment_method": null,
  "transfer_setups": [],
  "metadata": {},
  "expires_at": "2050-05-15T13:45:30Z",
  "success_url": "https://google.com",
  "cancel_url": "https://amazon.com",
  "created_at": "2025-05-15T13:45:30Z",
  "total_in_cents": "500",
  "currency": "GTQ",
  "latest_intent": null
}
```

---

## GET /api/checkouts

Obtiene todos los checkouts. Soporta filtros y paginación.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Query params**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `from_time` | string (ISO 8601) | Fecha/hora de inicio para filtrar. |
| `until_time` | string (ISO 8601) | Fecha/hora de fin para filtrar. |
| `user_id` | string | Filtrar checkouts de un usuario específico. |
| `page` | integer | Número de página. |
| `items` | integer | Cantidad de elementos por página. |

**Ejemplo de solicitud**

```bash
curl --location 'https://app.recurrente.com/api/checkouts?from_time=2024-05-15T13%3A45%3A30Z&until_time=2050-05-15T13%3A45%3A30Z&user_id=us_123' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}'
```

**Respuesta exitosa `200 OK`**

```json
[{
  "id": "ch_lmgbvesmihkqzma3",
  "status": "paid",
  "payment": {
    "id": "pa_ttfeprgn",
    "paymentable": {
      "type": "Subscription",
      "id": "su_nehndm7j",
      "tax_name": null,
      "tax_id": null
    }
  },
  "payment_method": {
    "id": "pay_m_ru4ztzg3",
    "type": "card",
    "card": {
      "last4": "4242",
      "network": "visa"
    }
  },
  "transfer_setups": [],
  "metadata": {},
  "expires_at": "2050-05-15T13:45:30Z",
  "success_url": "https://google.com",
  "cancel_url": "https://amazon.com",
  "created_at": "2025-05-15T13:45:30Z",
  "total_in_cents": "500",
  "currency": "GTQ",
  "latest_intent": {
    "id": "pa_123",
    "created_at": "2025-05-15T13:45:30Z",
    "type": "PaymentIntent",
    "data": { "auth_code": "123456" }
  }
}]
```