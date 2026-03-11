# Plan de Mejoras Técnicas - Backend SaaS

## 1. Mejoras de Seguridad
- [ ] **Autenticación de Webhooks (Recurrente):** Implementar la validación de la firma criptográfica (HMAC/Signature header) enviada por Recurrente para verificar la autenticidad del payload.
- [ ] **Protección de Archivos Privados:** Deshabilitar el acceso público directo a la carpeta `uploads/` mediante `app.useStaticAssets`. Crear un controlador que requiera validación JWT para descargar o visualizar documentos y contratos.
- [ ] **Configuración de Cookies:** Actualizar la configuración de las cookies a `sameSite: 'none'` y `secure: true` si el frontend y el backend se desplegarán en dominios diferentes.

## 2. Mejoras de Rendimiento y Arquitectura
- [ ] **Optimización del `WorkspaceGuard`:** Eliminar la consulta a la base de datos (`this.workspacesService.findByUserId`) en cada petición. Inyectar el `workspaceId` y el `role` directamente en el payload del Access Token (JWT) o implementar caché con Redis.
- [ ] **Prevención de DoS en Body Parser:** Reducir el límite global de `BODY_PARSER_LIMIT` para JSON de `10mb` a `1mb` (o un valor menor adecuado).
- [ ] **Rate Limiting Dinámico:** Implementar límites de peticiones escalonados (tiers) dependiendo del plan de suscripción del usuario. Configurar `app.set('trust proxy', 1)` en Express para registrar correctamente las IPs si se usa un proxy inverso.

## 3. Mejoras de Escalabilidad y Trazabilidad
- [ ] **Migración de Storage para Producción:** Cambiar el proveedor de almacenamiento por defecto de `local` a `s3` o `cloudinary` en el entorno de producción para permitir el escalado horizontal de la aplicación.
- [ ] **Sistema de Auditoría (Audit Logs):** Crear un módulo o interceptor que registre un historial de acciones críticas (ej. cambios de estado en proyectos, eliminación de documentos, invitaciones de equipo) por cada entorno de trabajo.