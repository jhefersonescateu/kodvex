import hashlib
import json
import os
import random
import re
import secrets
from datetime import datetime, timedelta, timezone

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, request
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

load_dotenv()

app = Flask(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOW_TEST_CODE = os.getenv("ALLOW_TEST_CODE", "false").lower() == "true"

verification_store = {}
users_store = {}
session_store = {}


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_code() -> str:
    return str(random.randint(100000, 999999))


def get_client_config() -> dict:
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    default_redirect = f"{FRONTEND_URL}/api/auth/google/callback"
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", default_redirect)

    if not client_id or not client_secret:
        raise ValueError("Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en las variables de entorno.")

    return {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "redirect_uris": [redirect_uri],
        }
    }


def get_google_oauth_flow() -> Flow:
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", f"{FRONTEND_URL}/api/auth/google/callback")
    flow = Flow.from_client_config(
        get_client_config(),
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
        redirect_uri=redirect_uri,
    )
    return flow


def get_google_credentials() -> Credentials:
    refresh_token = os.getenv("GMAIL_REFRESH_TOKEN")
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

    if not refresh_token or not client_id or not client_secret:
        raise ValueError("Faltan GMAIL_REFRESH_TOKEN, GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET.")

    return Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=["https://www.googleapis.com/auth/gmail.send"],
    )


def send_verification_email(email: str, code: str) -> None:
    creds = get_google_credentials()
    creds.refresh(Request())
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

    message = (
        "From: {}\r\n"
        "To: {}\r\n"
        "Subject: Código de verificación Kodvex\r\n"
        "MIME-Version: 1.0\r\n"
        "Content-Type: text/html; charset=UTF-8\r\n\r\n"
        "{}"
    ).format(gmail_from, email, body)

    encoded_message = message.encode("utf-8")
    base64_message = __import__("base64").urlsafe_b64encode(encoded_message).decode("utf-8")
    service.users().messages().send(userId="me", body={"raw": base64_message}).execute()


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "message": "Backend OK"})


@app.get("/api/auth/google/login")
def google_login():
    flow = get_google_oauth_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return jsonify({"url": auth_url})


@app.get("/api/auth/google/callback")
def google_callback():
    code = request.args.get("code")
    error = request.args.get("error")

    if error:
        return jsonify({"error": error}), 400

    if not code:
        return jsonify({"error": "Falta el código de Google."}), 400

    flow = get_google_oauth_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials

    response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {credentials.token}"},
        timeout=30,
    )
    response.raise_for_status()
    user_data = response.json()

    email = str(user_data.get("email") or "").strip().lower()
    name = str(user_data.get("name") or email.split("@", 1)[0] or "Usuario").strip()

    if not email:
        return jsonify({"error": "No se pudo obtener el email de Google."}), 400

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
    session_store[token] = {
        "email": email,
        "user": user,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
    }

    redirect_target = f"{FRONTEND_URL}/?auth=success&token={token}&email={email}&name={name}"
    return redirect(redirect_target)


@app.get("/api/auth/me")
def get_current_user():
    token = request.args.get("token")
    if not token:
        return jsonify({"error": "Falta token."}), 401

    session = session_store.get(token)
    if not session:
        return jsonify({"error": "Token inválido o expirado."}), 401

    expires_at = datetime.fromisoformat(session["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        session_store.pop(token, None)
        return jsonify({"error": "Sesión expirada."}), 401

    return jsonify({"user": session["user"]})


@app.post("/api/send-verification")
def send_verification():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email") or "").strip().lower()

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify({"error": "Email inválido."}), 400

    code = generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    verification_store[email] = {"code_hash": sha256(code), "expires_at": expires_at}

    try:
        send_verification_email(email, code)
        return jsonify({
            "success": True,
            "message": "Código enviado correctamente.",
            "dev_code": code if ALLOW_TEST_CODE else None,
        })
    except Exception as exc:
        verification_store.pop(email, None)
        return jsonify({
            "error": "No se pudo enviar el correo. Revisa las variables de entorno de Gmail y Google OAuth.",
            "details": str(exc),
        }), 500


@app.post("/api/verify-code")
def verify_code():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email") or "").strip().lower()
    code = str(data.get("code") or "").strip()

    if not re.fullmatch(r"\d{6}", code):
        return jsonify({"error": "El código debe tener 6 dígitos."}), 400

    record = verification_store.get(email)
    if not record:
        return jsonify({"error": "No existe un código para este correo."}), 400

    if datetime.now(timezone.utc) > record["expires_at"]:
        verification_store.pop(email, None)
        return jsonify({"error": "El código ha expirado."}), 400

    if record["code_hash"] != sha256(code):
        return jsonify({"error": "Código incorrecto."}), 400

    verification_store.pop(email, None)
    return jsonify({"success": True, "message": "Código verificado correctamente."})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "4000")), debug=True)
