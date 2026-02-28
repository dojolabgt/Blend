Recurrente: Documentación API

La API de Recurrente te permite crear sesiones de compra, manejar tus productos, suscripciones, y clientes, hacer transferencias de dinero entre diferentes cuentas de Recurrente, y mucho más.
Cómo empezar

    Crea una cuenta en Recurrente.

    La API responde en formato JSON. Cuando retorna un error, el error es enviado en un error key en JSON.

Autenticación

Para encontrar tus Llaves de API, dentro de tu cuenta de Recurrente, ve a:

Configuración → Llaves API.

Para autenticarte, debes enviar los siguientes headers en cada request:
Header	Description
X-PUBLIC-KEY	tu_llave_publica
X-SECRET-KEY	tu_llave_privada
Error en la autenticación

Si tus llaves de API no se están enviando o son inválidas, recibirás un código de respuesta HTTP 401 Unauthorized.
Sandbox y pagos de prueba

Existen dos formas de realizar pruebas: usando el ambiente Sandbox o haciendo pruebas directamente en producción, dependiendo del tipo de validación que necesites.
✅ Ambiente Sandbox

El ambiente Sandbox permite hacer pagos de prueba sin generar actividad real. Para utilizarlo:

    Usa tus llaves de ambiente TEST.

    Simula un pago exitoso con la tarjeta 4242 4242 4242 4242.

Los checkouts creados con llaves TEST:

    Muestran un aviso que dice "PRUEBA" en el link de pago.

    Tienen el atributo live_mode = false.

    No crean actividad en la cuenta ni afectan el balance.

    No disparan webhooks.

    Este ambiente es ideal para pruebas durante la integración inicial o desarrollo. 

⚠️ Pruebas en producción

También es posible realizar pruebas en ambiente LIVE con tus llaves de producción. En estos casos:

    Se recomienda reembolsar los pagos de prueba el mismo día, ya sea desde el panel de Recurrente o mediante la API en /api/refunds.

    Los pagos reembolsados el mismo día son reembolsados al 100% del monto.

    Esta opción permite validar el flujo completo, incluyendo actividad en cuenta, webhooks y conciliación. 