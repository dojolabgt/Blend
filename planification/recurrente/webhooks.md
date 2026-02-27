# Webhook Endpoints

Los webhook endpoints permiten recibir notificaciones automáticas sobre eventos en tu cuenta de Recurrente.

---

## POST /api/webhook_endpoints/

Crea un nuevo webhook endpoint.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Body (JSON)**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `url` | string | ✅ | URL a la que se enviarán los webhooks. |
| `description` | string | Opcional | Breve descripción del endpoint. |
| `metadata` | object | Opcional | Información adicional a adjuntar al endpoint. |

**Ejemplo de solicitud**

```bash
curl --location 'https://app.recurrente.com/api/webhook_endpoints/' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}' \
--header 'Content-Type: application/json' \
--data '{
    "url": "https://example.com/webhook",
    "description": "Optional description of the endpoint",
    "metadata": {}
}'
```

**Respuesta exitosa `200 OK`**

```json
{
  "description": "Optional description of the endpoint",
  "url": "https://example.com/webhook",
  "disabled": false,
  "createdAt": "2024-05-03T18:28:07.673413Z",
  "updatedAt": "2024-05-03T18:28:07.673427Z",
  "id": "ep_2fy6I9KODnHzw7Zf0ZGmMs8gEN9",
  "metadata": {}
}
```

---

## GET /api/webhook_endpoints/

Obtiene todos los webhook endpoints registrados.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Ejemplo de solicitud**

```bash
curl --location 'https://app.recurrente.com/api/webhook_endpoints/' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}'
```

**Respuesta exitosa `200 OK`**

```json
[
  {
    "description": "Optional description of the endpoint",
    "url": "https://example.com/webhook",
    "disabled": false,
    "createdAt": "2024-05-03T18:28:07.673413Z",
    "updatedAt": "2024-05-03T18:28:07.673427Z",
    "id": "ep_2fy6I9KODnHzw7Zf0ZGmMs8gEN9",
    "metadata": {}
  }
]
```

---

## DELETE /api/webhook_endpoints/:webhookId

Elimina un webhook endpoint existente.

**Headers**

| Key | Value |
|-----|-------|
| `X-PUBLIC-KEY` | `{{recurrente_public_key}}` |
| `X-SECRET-KEY` | `{{recurrente_private_key}}` |

**Ejemplo de solicitud**

```bash
curl --location -g --request DELETE 'https://app.recurrente.com/api/webhook_endpoints/{{webhookId}}' \
--header 'X-PUBLIC-KEY: {{recurrente_public_key}}' \
--header 'X-SECRET-KEY: {{recurrente_private_key}}'
```

**Respuesta exitosa `200 OK`**

```json
{
  "description": "Optional description of the endpoint",
  "url": "https://example.com/webhook",
  "disabled": false,
  "createdAt": "2024-05-03T18:28:07.673413Z",
  "updatedAt": "2024-05-03T18:28:07.673427Z",
  "id": "ep_2fy6I9KODnHzw7Zf0ZGmMs8gEN9",
  "metadata": {}
}
```