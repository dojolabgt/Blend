# Google OAuth — Implementación pendiente

## Problema actual
La ruta `/auth/google` devuelve 404 porque el backend **no tiene implementado** Google OAuth.
Los env vars están definidos pero nunca se construyó la estrategia Passport.

---

## Prerequisitos externos

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar **Google+ API** u **OAuth 2.0**
3. Crear credenciales OAuth → tipo "Aplicación web"
4. Agregar Redirect URIs autorizados:
   - Local: `http://localhost:4000/auth/google/callback`
   - Producción: `https://tu-dominio.com/auth/google/callback`
5. Copiar `Client ID` y `Client Secret` al `.env`

---

## Backend — cambios necesarios

### 1. Instalar dependencias
```bash
npm install passport-google-oauth20
npm install -D @types/passport-google-oauth20
```

### 2. Agregar campo `googleId` al User entity
```ts
// backend/src/users/entities/user.entity.ts
@Column({ nullable: true })
googleId: string | null;
```
+ migración correspondiente.

### 3. Crear `google.strategy.ts`
```
backend/src/auth/strategies/google.strategy.ts
```
- Extiende `PassportStrategy(Strategy, 'google')`
- Scopes: `['email', 'profile']`
- `validate()`: busca usuario por googleId o email, crea si no existe

### 4. Crear `google-auth.guard.ts`
```
backend/src/auth/guards/google-auth.guard.ts
```
- `@Injectable() export class GoogleAuthGuard extends AuthGuard('google')`

### 5. Actualizar `auth.controller.ts`
```ts
// Iniciar flujo OAuth
@Get('google')
@UseGuards(GoogleAuthGuard)
async googleAuth() {}

// Callback de Google
@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleCallback(@Req() req, @Res() res) {
  // setear cookies JWT igual que en login normal
  // redirigir a FRONTEND_URL/dashboard
}
```

### 6. Actualizar `auth.service.ts`
- Método `loginWithGoogle(googleUser)`: busca por `googleId` → fallback por email → crea usuario nuevo
- Si el usuario ya existe con email local → vincular `googleId` (caso "link account" desde settings)

### 7. Actualizar `auth.module.ts`
- Importar `GoogleStrategy` en providers

---

## Frontend — cambios necesarios

### Login / Register
El botón "Continuar con Google" ya existe en la UI.
Solo necesita apuntar a: `${API_URL}/auth/google`

### Settings → Seguridad → "Vincular cuenta Google"
- El botón "Vincular" también debe navegar a `${API_URL}/auth/google?mode=link`
- El backend detecta `mode=link` + JWT existente en cookie para vincular sin crear sesión nueva

---

## Env vars requeridas

```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com  # solo si se usa Google Identity en frontend
```

---

## Notas
- El flujo de "link account" desde settings requiere que el callback sepa si es login nuevo o vinculación — pasar state o query param.
- Considerar qué pasa si el email de Google ya existe con contraseña local → ofrecer merge o rechazar con mensaje claro.
