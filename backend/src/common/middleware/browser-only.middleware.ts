import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Bloquea requests que no provengan del frontend autorizado.
 *
 * Dos condiciones — basta con cumplir UNA:
 *   1. El header `Origin` coincide con FRONTEND_URL / FRONTEND_PUBLIC_URL
 *   2. El header `X-Client-Type: web` está presente (lo inyecta el axios del frontend)
 *
 * Solo activo en producción. En dev se deja pasar todo.
 *
 * Rutas excluidas (públicas / webhooks):
 *   - /auth/*          login, register, refresh, google oauth
 *   - /webhooks/*      webhooks de Recurrente
 *   - /portal/*        portal público del cliente
 *   - /connections/public/*  aceptación de invitaciones
 */
@Injectable()
export class BrowserOnlyMiddleware implements NestMiddleware {
  private readonly allowedOrigins: string[];

  private static readonly PUBLIC_PREFIXES = [
    '/auth/',
    '/webhooks/',
    '/portal/',
    '/connections/public/',
    '/uploads/',
    '/public/',
  ];

  constructor(private readonly config: ConfigService) {
    const frontendUrl       = config.get<string>('FRONTEND_URL') ?? '';
    const frontendPublicUrl = config.get<string>('FRONTEND_PUBLIC_URL') ?? '';

    this.allowedOrigins = [
      ...frontendUrl.split(','),
      ...frontendPublicUrl.split(','),
    ]
      .map((u) => u.trim())
      .filter(Boolean);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Solo aplica en producción
    if (process.env.NODE_ENV !== 'production') return next();

    // Dejar pasar preflight CORS
    if (req.method === 'OPTIONS') return next();

    // Dejar pasar rutas públicas
    const path = req.path;
    const isPublic = BrowserOnlyMiddleware.PUBLIC_PREFIXES.some((prefix) =>
      path.startsWith(prefix),
    );
    if (isPublic) return next();

    const origin     = req.headers['origin'] as string | undefined;
    const clientType = req.headers['x-client-type'] as string | undefined;

    const hasValidOrigin =
      origin !== undefined &&
      this.allowedOrigins.some((allowed) => origin === allowed);

    const hasClientHeader = clientType === 'web';

    if (!hasValidOrigin && !hasClientHeader) {
      throw new ForbiddenException('Acceso directo a la API no permitido.');
    }

    return next();
  }
}
