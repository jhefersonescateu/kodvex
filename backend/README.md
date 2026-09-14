# Kodvex backend

Este backend está preparado para:

- aceptar peticiones del frontend React
- generar códigos de verificación de 6 dígitos
- enviar correos con Gmail API usando OAuth2
- autenticar usuarios con Google
- crear usuarios en memoria y devolver una sesión segura

## 1) Instalar dependencias

```bash
cd backend
python -m venv .venv
.
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Configurar variables de entorno

Copia `.env.example` a `.env` y completa los valores.

```powershell
copy .env.example .env
```

## 3) Guardar el JSON de Google

El archivo JSON de Google OAuth debe quedar en:

```text
backend/credentials/google-oauth-client.json
```

## 4) Ejecutar

```powershell
python app.py
```

## 5) Endpoints principales

- `GET /health`
- `GET /api/auth/google/login`
- `GET /api/auth/google/callback`
- `GET /api/auth/me?token=...`
- `POST /api/send-verification`
- `POST /api/verify-code`

> Este backend usa memoria en proceso para usuarios/sesiones. Para producción real, conviene moverlo a Supabase o una base de datos persistente.
