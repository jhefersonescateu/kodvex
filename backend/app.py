import hashlib
import json
import os
import random
import re
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from pydantic import BaseModel, EmailStr

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")
ALLOWED_ORIGINS = [FRONTEND_URL]
ALLOW_TEST_CODE = os.getenv("ALLOW_TEST_CODE", "false").lower() == "true"

app = FastAPI(title="Kodvex Auth Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

verification_store: dict[str, dict] = {}
users_store: dict[str, dict] = {}
session_store: dict[str, dict] = {}


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_code() -> str:
    return str(random.randint(100000, 999999))


def get_google_credentials() -> Credentials:
    credentials_path = BASE_DIR / "credentials" / "google-oauth-client.json"
    if not credentials_path.exists():
        raise FileNotFoundError(
            "No se encontró el archivo JSON de Google OAuth en backend/credentials/google-oauth-client.json"
        )

    with credentials_path.open("r", encoding="utf-8") as f:
        oauth_data = json.load(f)

    client_id = oauth_data["web"]["client_id"]
    client_secret = oauth_data["web"]["client_secret"]
    refresh_token = os.getenv("GMAIL_REFRESH_TOKEN")
    if not refresh_token:
        raise ValueError("Falta GMAIL_REFRESH_TOKEN en .env")

    return Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=["https://www.googleapis.com/auth/gmail.send"],
    )


def get_google_oauth_flow() -> Flow:
    credentials_path = BASE_DIR / "credentials" / "google-oauth-client.json"
    if not credentials_path.exists():
        raise FileNotFoundError(
            "No se encontró el archivo JSON de Google OAuth en backend/credentials/google-oauth-client.json"
        )

    with credentials_path.open("r", encoding="utf-8") as f:
        client_config = json.load(f)

    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", f"{FRONTEND_URL}/api/auth/google/callback")
    flow = Flow.from_client_config(
        client_config,
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
        redirect_uri=redirect_uri,
    )
    return flow


async def send_verification_email(email: str, code: str) -> None:
    creds = get_google_credentials()
    service = build("gmail", "v1", credentials=creds)
    gmail_from = os.getenv("GMAIL_FROM", "tu-cuenta@gmail.com")

    body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="margin-bottom: 12px;">Código de verificación</h2>
          <p style="margin: 0 0 16px;">Tu código es:</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 18px; text-align: center; font-size: 32px; letter-spacing: 6px; font-weight: 700;">
            {code}
          </div>
          <p style="margin-top: 18px; color: #6b7280; font-size: 14px;">Este código expira en 5 minutos.</p>
        </div>
      </body>
    </html>
    """

    email_message = (
        "From: {}\r\n"
        "To: {}\r\n"
        "Subject: Código de verificación Kodvex\r\n"
        "MIME-Version: 1.0\r\n"
        "Content-Type: text/html; charset=UTF-8\r\n\r\n"
        "{}"
    ).format(gmail_from, email, body)

    encoded_message = email_message.encode("utf-8")
    base64_message = __import__("base64").urlsafe_b64encode(encoded_message).decode("utf-8")

    service.users().messages().send(
        userId="me",
        body={"raw": base64_message},
    ).execute()


class SendVerificationRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str


@app.get("/health")
def health() -> dict:
    return {"ok": True, "message": "Backend OK"}


@app.get("/api/auth/google/login")
def google_login() -> dict:
    flow = get_google_oauth_flow()
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return {"url": authorization_url}


@app.get("/api/auth/google/callback")
def google_callback(code: str | None = None, error: str | None = None) -> RedirectResponse:
    if error:
        raise HTTPException(status_code=400, detail={"message": error})

    if not code:
        raise HTTPException(status_code=400, detail={"message": "Falta el código de Google."})

    flow = get_google_oauth_flow()
    flow.fetch_token(code=code)

    creds = flow.credentials
    response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {creds.token}"},
        timeout=30,
    )
    response.raise_for_status()
    user_data = response.json()

    email = str(user_data.get("email") or "").strip().lower()
    name = str(user_data.get("name") or email.split("@", 1)[0] or "Usuario").strip()

    if not email:
        raise HTTPException(status_code=400, detail={"message": "No se pudo obtener el email de Google."})

    user = users_store.setdefault(
        email,
        {
            "id": sha256(email),
            "email": email,
            "name": name,
            "provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )

    token = secrets.token_urlsafe(32)
    session_store[token] = {"email": email, "user": user, "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()}

    redirect_target = (
        f"{FRONTEND_URL}/?auth=success&token={token}&email={email}&name={name}"
    )
    return RedirectResponse(url=redirect_target)


@app.get("/api/auth/me")
def get_current_user(token: str) -> dict:
    session = session_store.get(token)
    if not session:
        raise HTTPException(status_code=401, detail={"message": "Token inválido o expirado."})

    expires_at = datetime.fromisoformat(session["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        session_store.pop(token, None)
        raise HTTPException(status_code=401, detail={"message": "Sesión expirada."})

    return {"user": session["user"]}


@app.post("/api/send-verification")
async def send_verification(payload: SendVerificationRequest) -> dict:
    email = str(payload.email).strip().lower()

    code = generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    verification_store[email] = {
        "code_hash": sha256(code),
        "expires_at": expires_at,
    }

    try:
        await send_verification_email(email, code)
        return {
            "success": True,
            "message": "Código enviado correctamente.",
            "dev_code": code if ALLOW_TEST_CODE else None,
        }
    except Exception as exc:
        verification_store.pop(email, None)
        raise HTTPException(
            status_code=500,
            detail={
                "message": "No se pudo enviar el correo. Revisa el refresh token, la API de Gmail y el JSON OAuth.",
                "error": str(exc),
            },
        ) from exc


@app.post("/api/verify-code")
def verify_code(payload: VerifyCodeRequest) -> dict:
    email = str(payload.email).strip().lower()
    code = str(payload.code).strip()

    if not re.fullmatch(r"\d{6}", code):
        raise HTTPException(status_code=400, detail={"message": "El código debe tener 6 dígitos."})

    record = verification_store.get(email)
    if not record:
        raise HTTPException(status_code=400, detail={"message": "No existe un código para este correo."})

    if datetime.now(timezone.utc) > record["expires_at"]:
        verification_store.pop(email, None)
        raise HTTPException(status_code=400, detail={"message": "El código ha expirado."})

    if record["code_hash"] != sha256(code):
        raise HTTPException(status_code=400, detail={"message": "Código incorrecto."})

    verification_store.pop(email, None)
    return {"success": True, "message": "Código verificado correctamente."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", "4000")), reload=True)
