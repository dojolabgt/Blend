# Embedded Checkouts

Recurrente Checkout es una librería JavaScript que te permite insertar un checkout responsivo y seguro directamente en tu página web. Funciona mostrando un **iframe** con la sesión de pago y maneja callbacks para eventos clave como éxito, fallo o pagos en proceso.

- 📖 Repo oficial: [https://github.com/recurrente/recurrente-checkout](https://github.com/recurrente/recurrente-checkout)
- 🎥 Video demo: [https://youtu.be/OUIYVcrnPr0](https://youtu.be/OUIYVcrnPr0)

> **Antes de comenzar:** Necesitas crear un checkout en Recurrente. Consulta la [documentación de checkouts](./checkouts.md) para obtener tu URL de checkout.

---

## Instalación

### NPM (Recomendado)

```bash
npm install recurrente-checkout
```

### CDN

> ⚠️ En producción, usa una versión específica (ej. `@0.0.4`) en lugar de `@latest` para evitar romper integraciones al actualizar automáticamente.

**Unpkg**
```html
<script src="https://unpkg.com/recurrente-checkout@latest/recurrente-checkout.js"></script>
```

**jsDelivr**
```html
<script src="https://cdn.jsdelivr.net/npm/recurrente-checkout@latest/recurrente-checkout.js"></script>
```

---

## Contenedor HTML requerido

El checkout se renderiza como un iframe dentro del elemento con el ID `recurrente-checkout-container`. Asegúrate de incluirlo en tu página:

```html
<div id="recurrente-checkout-container"></div>
```

El iframe se ajusta automáticamente al tamaño del contenedor y es responsive. Puedes personalizarlo con CSS.

---

## Inicialización

### ES6 Modules (Recomendado)

```javascript
import RecurrenteCheckout from 'recurrente-checkout';

RecurrenteCheckout.load({
  url: "https://app.recurrente.com/checkout-session/ch_1234",
  onSuccess: function(paymentData) {
    console.log('Pago exitoso:', paymentData);
    // Redirigir a página de éxito, actualizar UI, etc.
  },
  onFailure: function(error) {
    console.log('Pago fallido:', error);
    // Mostrar mensaje de error, opción de reintentar, etc.
  },
  onPaymentInProgress: function() {
    console.log('Pago con transferencia bancaria en proceso');
    // Solo para transferencias bancarias (puede tomar hasta 24h)
  }
});
```

### Importación nominal

```javascript
import { loadRecurrenteCheckout } from 'recurrente-checkout';

loadRecurrenteCheckout({
  url: "https://app.recurrente.com/checkout-session/ch_1234",
  onSuccess: function(paymentData) { /* ... */ },
  onFailure: function(error) { /* ... */ },
  onPaymentInProgress: function() { /* ... */ }
});
```

### CommonJS

```javascript
const RecurrenteCheckout = require('recurrente-checkout');

RecurrenteCheckout.load({
  url: "https://app.recurrente.com/checkout-session/ch_1234",
  onSuccess: function(paymentData) { /* ... */ },
  onFailure: function(error) { /* ... */ },
  onPaymentInProgress: function() { /* ... */ }
});
```

### Navegador (Global / CDN)

```html
<script src="https://unpkg.com/recurrente-checkout@latest/recurrente-checkout.js"></script>
<script>
  RecurrenteCheckout.load({
    url: "https://app.recurrente.com/s/your-checkout-url",
    onSuccess: function(paymentData) { /* ... */ },
    onFailure: function(error) { /* ... */ },
    onPaymentInProgress: function() { /* ... */ }
  });
</script>
```

---

## Métodos de URL

### Método A: URL de checkout directa

```javascript
RecurrenteCheckout.load({
  url: "https://app.recurrente.com/checkout-session/ch_1234",
  onSuccess: function(paymentData) {
    console.log('Checkout ID:', paymentData.checkoutId);
  },
  onFailure: function(data) {
    console.log('Error:', data.error);
  },
  onPaymentInProgress: function() {
    // Solo para transferencias bancarias (hasta 24h de procesamiento)
  }
});
```

### Método B: URL de producto

Formato: `https://app.recurrente.com/s/{organization}/{product-slug}`

```javascript
RecurrenteCheckout.load({
  url: "https://app.recurrente.com/s/mi-cuenta/mi-producto",
  onSuccess: function(paymentData) { /* ... */ },
  onFailure: function(error) { /* ... */ },
  onPaymentInProgress: function() { /* ... */ }
});
```

> Reemplaza `mi-cuenta` con tu slug de organización y `mi-producto` con tu slug de producto.

---

## Callbacks

| Callback | Cuándo se ejecuta | Parámetros |
|----------|-------------------|------------|
| `onSuccess` | Pago completado exitosamente | `paymentData` (incluye `checkoutId`) |
| `onFailure` | Pago fallido | `error` / `data.error` |
| `onPaymentInProgress` | Pago por transferencia bancaria iniciado | — |