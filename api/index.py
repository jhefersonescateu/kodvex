import hashlib
import json
import os
import random
import re
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, request
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

load_dotenv()

app = Flask(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://kodvex.vercel.app")
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
    logo_url = f"{FRONTEND_URL.rstrip('/')}/favicon.svg"

    body = f"""
    <html>
            <body style="margin:0; padding:0; background:#f4f5fb; font-family:Arial,Helvetica,sans-serif; color:#172033;">
                <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Tu código de verificación de Kodvex es {code}.</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5fb; padding:32px 16px;">
                    <tr><td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background:#ffffff; border:1px solid #e5e7eb; border-radius:18px; overflow:hidden;">
                            <tr><td style="padding:24px 30px; background:#090b1d;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td width="48"><img src="{logo_url}" width="40" height="40" alt="Kodvex" style="display:block; border:0;"></td>
                                        <td style="padding-left:12px; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:1px;">KODVEX</td>
                                    </tr>
                                </table>
                            </td></tr>
                            <tr><td style="padding:36px 30px 30px;">
                                <p style="margin:0 0 10px; color:#6d5dfc; font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;">Verificación de cuenta</p>
                                <h1 style="margin:0 0 14px; color:#172033; font-size:28px; line-height:1.2;">Confirma tu correo</h1>
                                <p style="margin:0 0 26px; color:#5f687a; font-size:16px; line-height:1.6;">Usa este código para continuar con la creación de tu cuenta en Kodvex:</p>
                                <div style="padding:20px 16px; background:#f1efff; border:1px solid #ded9ff; border-radius:12px; color:#4438b8; text-align:center; font-size:34px; letter-spacing:8px; font-weight:700;">{code}</div>
                                <p style="margin:24px 0 0; color:#7b8495; font-size:14px; line-height:1.6;">Este código caduca en 5 minutos. Si no solicitaste este correo, puedes ignorarlo.</p>
                            </td></tr>
                            <tr><td style="padding:18px 30px; border-top:1px solid #edf0f5; color:#929aaa; font-size:12px; line-height:1.5;">© 2026 Kodvex · Software que impulsa tus ideas</td></tr>
                        </table>
                    </td></tr>
                </table>
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

    try:
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
    except Exception as exc:
        app.logger.exception("Google OAuth callback failed")
        error_type = type(exc).__name__
        return jsonify({
            "error": "No se pudo completar el acceso con Google. Inténtalo de nuevo.",
            "code": error_type,
        }), 502

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

    redirect_target = f"{FRONTEND_URL}/?{urlencode({'auth': 'success', 'token': token, 'email': email, 'name': name})}"
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


@app.post("/api/create-account")
def create_account():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email") or "").strip().lower()
    name = str(data.get("name") or "").strip()
    role = str(data.get("role") or "").strip()
    password = str(data.get("password") or "")

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or not name or not role:
        return jsonify({"error": "Faltan datos obligatorios de la cuenta."}), 400

    if password and len(password) < 8:
        return jsonify({"error": "La contraseña debe tener al menos 8 caracteres."}), 400

    user = users_store.setdefault(email, {"id": sha256(email), "email": email})
    user.update({
        "name": name,
        "role": role,
        "phone": str(data.get("phone") or "").strip(),
        "account_type": str(data.get("accountType") or "").strip(),
        "location": str(data.get("location") or "").strip(),
        "specialty": str(data.get("specialty") or "").strip(),
        "provider": str(data.get("provider") or "manual").strip(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    if password:
        user["password_hash"] = sha256(password)

    return jsonify({"success": True, "user": {key: value for key, value in user.items() if key != "password_hash"}})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "4000")), debug=True)
