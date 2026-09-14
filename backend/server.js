import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { google } from 'googleapis'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = Number(process.env.PORT || 4000)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const ALLOW_TEST_CODE = process.env.ALLOW_TEST_CODE === 'true'

const verificationCodes = new Map()

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function readGoogleCredentials() {
  const credentialsPath = path.join(__dirname, 'credentials', 'google-oauth-client.json')

  if (!fs.existsSync(credentialsPath)) {
    throw new Error('No se encontró el archivo JSON de Google OAuth en backend/credentials/google-oauth-client.json')
  }

  const raw = fs.readFileSync(credentialsPath, 'utf8')
  return JSON.parse(raw)
}

function getOAuthClient() {
  const credentials = readGoogleCredentials()
  const oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0]
  )

  if (process.env.GMAIL_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    })
  }

  return oauth2Client
}

async function sendVerificationEmail(email, code) {
  const gmailFrom = process.env.GMAIL_FROM || 'tu-cuenta@gmail.com'
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN

  if (!refreshToken) {
    throw new Error('Falta GMAIL_REFRESH_TOKEN en .env. Autoriza primero la cuenta de Gmail para obtener el token.')
  }

  const oauth2Client = getOAuthClient()
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="margin: 0 0 12px; color: #111827;">Código de verificación</h2>
      <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Tu código es:</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 18px; text-align: center; font-size: 32px; letter-spacing: 6px; font-weight: 700; color: #111827;">
        ${code}
      </div>
      <p style="margin-top: 18px; color: #6b7280; font-size: 14px;">Este código expira en 5 minutos.</p>
    </div>
  `

  const rawMessage = [
    `To: ${email}`,
    `From: ${gmailFrom}`,
    'Subject: Código de verificación Kodvex',
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    emailBody,
  ].join('\r\n')

  const encodedMessage = Buffer.from(rawMessage).toString('base64url')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  })
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'Backend OK' })
})

app.post('/api/send-verification', async (req, res) => {
  try {
    const { email } = req.body || {}
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Email inválido.' })
    }

    const code = generateCode()
    const codeHash = sha256(code)
    const expiresAt = Date.now() + 5 * 60 * 1000

    verificationCodes.set(normalizedEmail, { codeHash, expiresAt })

    await sendVerificationEmail(normalizedEmail, code)

    return res.json({
      success: true,
      message: 'Código enviado correctamente.',
      devCode: ALLOW_TEST_CODE ? code : undefined,
    })
  } catch (error) {
    console.error('Error in /api/send-verification:', error)
    return res.status(500).json({
      message: 'No se pudo enviar el correo. Revisa tus credenciales de Gmail y el token OAuth.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

app.post('/api/verify-code', (req, res) => {
  try {
    const { email, code } = req.body || {}
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedCode = String(code || '').trim()

    if (!normalizedEmail || !normalizedCode) {
      return res.status(400).json({ message: 'Faltan datos para verificar.' })
    }

    const record = verificationCodes.get(normalizedEmail)

    if (!record) {
      return res.status(400).json({ message: 'No existe un código para este correo.' })
    }

    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(normalizedEmail)
      return res.status(400).json({ message: 'El código ha expirado.' })
    }

    const isValid = sha256(normalizedCode) === record.codeHash

    if (!isValid) {
      return res.status(400).json({ message: 'Código incorrecto.' })
    }

    verificationCodes.delete(normalizedEmail)
    return res.json({ success: true, message: 'Código verificado correctamente.' })
  } catch (error) {
    console.error('Error in /api/verify-code:', error)
    return res.status(500).json({ message: 'Error interno al verificar el código.' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend activo en http://localhost:${PORT}`)
})
