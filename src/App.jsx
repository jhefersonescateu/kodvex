import { useEffect, useRef, useState } from 'react'
import './App.css'

const categories = ['Páginas web', 'Apps de escritorio', 'Sistemas', 'A medida']

const projects = [
  {
    name: 'Nexus Studio',
    category: 'Páginas web',
    price: 'S/ 1,200',
    description: 'Landing page moderna para una agencia creativa con reserva de citas y portafolio dinámico.',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    tags: ['Diseño', 'Lead gen', 'SEO'],
  },
  {
    name: 'SIS Gestión',
    category: 'Sistemas',
    price: 'S/ 2,800',
    description: 'Sistema interno para administración de ventas, inventario y reportes para negocios medianos.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    tags: ['ERP', 'Dashboard', 'Reportes'],
  },
  {
    name: 'QuickDesk Pro',
    category: 'Apps de escritorio',
    price: 'S/ 1,850',
    description: 'Aplicación desktop para gestión de clientes, tareas y archivos con flujo de trabajo claro.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    tags: ['Desktop', 'Productividad', 'Seguridad'],
  },
  {
    name: 'MetricaFlow',
    category: 'A medida',
    price: 'S/ 3,400',
    description: 'Panel de métricas y automatizaciones para seguimiento de ventas, campañas y operaciones.',
    image:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80',
    tags: ['Automatización', 'Analytics', 'Integración'],
  },
  {
    name: 'Luna Shop',
    category: 'Páginas web',
    price: 'S/ 1,500',
    description: 'Tienda online con catálogo, carrito, pagos y experiencia visual enfocada en conversión.',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
    tags: ['Ecommerce', 'Carrito', 'UX'],
  },
  {
    name: 'ControlBox',
    category: 'Sistemas',
    price: 'S/ 2,200',
    description: 'Sistema de control operativo para equipos y procesos con seguimiento en tiempo real.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    tags: ['Operaciones', 'Control', 'Monitoreo'],
  },
]

const steps = [
  {
    number: '01',
    title: 'Explora',
    description: 'Revisa el catálogo y encuentra una solución cercana a tu necesidad o pide una versión a medida.',
  },
  {
    number: '02',
    title: 'Conversa el alcance',
    description: 'Hablamos de objetivos, funcionalidades, plazo y presupuesto para alinear todo antes de comenzar.',
  },
  {
    number: '03',
    title: 'Entrega y soporte',
    description: 'Recibes el producto final con acompañamiento, ajustes y soporte para que tu negocio siga creciendo.',
  },
]

const authSlides = [
  {
    kicker: 'Experiencias que inspiran',
    title: 'Páginas web',
    highlight: 'que capturan atención.',
    description: 'Diseños cinematográficos y funcionales para atraer clientes, vender mejor y dejar una primera impresión que realmente recuerden.',
    video:
      'https://res.cloudinary.com/neluxxvk/video/upload/v1788814448/Peru_Cinematic_Video_4K_-_Jotapegerd_1080p_h264.mp4',
    poster:
      'https://res.cloudinary.com/neluxxvk/video/upload/so_0/v1788814448/Peru_Cinematic_Video_4K_-_Jotapegerd_1080p_h264.jpg',
    duration: 25,
    accent: '#7ef9d6',
    accent2: '#74d8ff',
    ink: '#f2fffd',
    muted: '#d8f4f4',
  },
  {
    kicker: 'Operación con estilo',
    title: 'Control y claridad',
    highlight: 'en cada proceso.',
    description: 'Sistemas pensados para ordenar ventas, inventario, tareas y métricas con una visión limpia, rápida y preparada para crecer.',
    video:
      'https://res.cloudinary.com/neluxxvk/video/upload/v1788837162/Restaurant_Ad_Video_Template_Editable_-_Biteable_1080p_h264.mp4',
    poster:
      'https://res.cloudinary.com/neluxxvk/video/upload/so_0/v1788837162/Restaurant_Ad_Video_Template_Editable_-_Biteable_1080p_h264.jpg',
    duration: 12,
    accent: '#fbbf24',
    accent2: '#ff8a5b',
    ink: '#fff7ed',
    muted: '#fde3b5',
  },
  {
    kicker: 'Herramientas de alto rendimiento',
    title: 'Productividad',
    highlight: 'sin fricción.',
    description: 'Apps de escritorio diseñadas para que cada tarea avance con rapidez, seguridad y una experiencia que acompañe al equipo en su día a día.',
    video:
      'https://res.cloudinary.com/neluxxvk/video/upload/v1788837681/BMW_M3_Competition_-_4K_Cinematic_Short_Video_-_Damir_Who_1080p_h264.mp4',
    poster:
      'https://res.cloudinary.com/neluxxvk/video/upload/so_0/v1788837681/BMW_M3_Competition_-_4K_Cinematic_Short_Video_-_Damir_Who_1080p_h264.jpg',
    duration: 20,
    accent: '#7dd3fc',
    accent2: '#8b5cf6',
    ink: '#edf7ff',
    muted: '#d4ebff',
  },
  {
    kicker: 'Marca con sabor',
    title: 'Sabor y presentación',
    highlight: 'que enamoran.',
    description: 'Visuales pensados para resaltar productos, reforzar la identidad y hacer que cada degustación se sienta memorable desde el primer vistazo.',
    video:
      'https://res.cloudinary.com/neluxxvk/video/upload/v1789146825/Fertrin_Pasteler%C3%ADa_Comercial_Spot_Publicitario.mp4',
    poster:
      'https://res.cloudinary.com/neluxxvk/video/upload/so_0/v1789146825/Fertrin_Pasteler%C3%ADa_Comercial_Spot_Publicitario.jpg',
    duration: 25,
    accent: '#f9a8d4',
    accent2: '#fbbf24',
    ink: '#fff4fb',
    muted: '#ffe0ef',
  },
]

const accountRoles = [
  {
    id: 'buyer',
    name: 'Comprador',
    tag: 'Kodvex Market',
    description: 'Personas que quieren explorar proyectos, comparar opciones y contratar servicios.',
  },
  {
    id: 'freelancer',
    name: 'Programador / Freelancer',
    tag: 'Kodvex Studio',
    description: 'Profesionales que ofrecen servicios, entregan proyectos y crecen con la comunidad.',
  },
]

const STORAGE_KEY = 'kodvex-app-state-v1'

function buildAvatarUrl(name, email) {
  const displayName = name || email || 'Usuario'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f766e&color=ffffff&size=96`
}

function getApiBaseUrl() {
  if (typeof window === 'undefined') return 'https://kodvex.vercel.app'

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  return window.location.hostname === 'localhost' ? 'http://localhost:4000' : window.location.origin
}

function getStoredAppState() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawState = window.sessionStorage.getItem(STORAGE_KEY)
    return rawState ? JSON.parse(rawState) : null
  } catch {
    return null
  }
}

function App() {
  const shouldRestoreSession = (() => {
    if (typeof window === 'undefined' || !window.performance) return false

    const navigationEntry = window.performance.getEntriesByType('navigation')[0]
    return navigationEntry?.type === 'reload'
  })()

  const storedState = shouldRestoreSession ? getStoredAppState() : null
  const initialGoogleAuthState = (() => {
    if (typeof window === 'undefined') return null

    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')
    const token = params.get('token')
    const email = params.get('email')

    if (auth === 'success' && token && email) {
      return {
        view: 'login',
        authStep: 'roles',
      }
    }

    return null
  })()

  const [view, setView] = useState(initialGoogleAuthState?.view ?? storedState?.view ?? 'landing')
  const [activeSlide, setActiveSlide] = useState(storedState?.activeSlide ?? 0)
  const [message, setMessage] = useState('')
  const [isEnteringLogin, setIsEnteringLogin] = useState(false)
  const [authStep, setAuthStep] = useState(initialGoogleAuthState?.authStep ?? storedState?.authStep ?? 'login')
  const [accountUser, setAccountUser] = useState(storedState?.accountUser ?? null)
  const [pendingAccount, setPendingAccount] = useState(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(() => {
    const savedRoleId = storedState?.selectedRoleId ?? accountRoles[0].id
    return accountRoles.find((role) => role.id === savedRoleId) ?? accountRoles[0]
  })
  const videoRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          view,
          activeSlide,
          authStep,
          selectedRoleId: selectedRole.id,
          accountUser,
        })
      )
    } catch {
      // Ignore storage write failures.
    }
  }, [view, activeSlide, authStep, selectedRole, accountUser])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')
    const token = params.get('token')
    const email = params.get('email')
    const name = params.get('name')

    if (auth === 'success' && token && email) {
      const nextUser = {
        name: name || email.split('@', 1)[0] || 'Usuario',
        email,
        token,
        avatar: buildAvatarUrl(name || email.split('@', 1)[0], email),
      }

      setAccountUser(nextUser)
      setPendingAccount({
        email,
        name: nextUser.name,
        provider: 'google',
      })
      setView('login')
      setAuthStep('roles')
      setMessage('Google conectado. Completa los datos faltantes y crea tu cuenta.')

      const nextUrl = new URL(window.location.href)
      nextUrl.search = ''
      window.history.replaceState({}, '', nextUrl)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return

    document.title = view === 'login' ? 'Kodvex | Login' : 'Kodvex | Página principal'
  }, [view])

  useEffect(() => {
    if (view !== 'login') return undefined

    const slideTimer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % authSlides.length)
    }, (authSlides[activeSlide]?.duration ?? 20) * 1000)

    return () => window.clearTimeout(slideTimer)
  }, [view, activeSlide])

  useEffect(() => {
    if (view !== 'login' || !videoRef.current) return undefined

    const video = videoRef.current
    video.currentTime = 0
    video.play().catch(() => {})
  }, [view, activeSlide])

  async function handleLoginSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim().toLowerCase()

    if (!email) {
      setMessage('Ingresa un correo válido.')
      return
    }

    try {
      setMessage('Enviando código de verificación...')
      const response = await fetch(`${getApiBaseUrl()}/api/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo enviar el código.')
      }

      const name = email.split('@', 1)[0] || 'Usuario'
      setPendingAccount({ email, name })
      setAuthStep('verify')
      setMessage(
        data?.dev_code
          ? `Código enviado. Código de prueba: ${data.dev_code}`
          : 'Código enviado correctamente. Revisa tu correo.'
      )
    } catch (error) {
      setMessage(error.message || 'No se pudo enviar el codigo.')
    }
  }

  async function handleGoogleLogin() {
    try {
      setMessage('Abriendo Google para iniciar sesión...')
      const response = await fetch(`${getApiBaseUrl()}/api/auth/google/login`)
      const data = await response.json()

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'No se pudo iniciar sesión con Google.')
      }

      window.location.href = data.url
    } catch (error) {
      setMessage(error.message || 'No se pudo conectar con Google.')
    }
  }

  function handleCreateAccount() {
    setAuthStep('roles')
    setMessage('')
  }

  function handleSelectRole(role) {
    setSelectedRole(role)
    setAuthStep('role-form')
    setMessage('')
  }

  async function handleRoleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('role-name') ?? '').trim()
    const email = String(formData.get('role-email') ?? '').trim().toLowerCase()
    const password = String(formData.get('role-password') ?? '').trim()
    const phone = String(formData.get('role-phone') ?? '').trim()
    const accountType = String(formData.get('role-account-type') ?? '').trim()
    const location = String(formData.get('role-location') ?? '').trim()
    const specialty = String(formData.get('role-specialty') ?? '').trim()
    const stack = String(formData.get('role-stack') ?? '').trim()

    if (!name || !email || !password || !phone || !location) {
      setMessage('Completa los datos obligatorios antes de continuar.')
      return
    }

    if (password.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    const payload = {
      email,
      name,
      role: selectedRole.name,
      phone,
      password,
      accountType: selectedRole.id === 'buyer' ? accountType || 'persona-natural' : undefined,
      location,
      specialty: selectedRole.id === 'freelancer' ? specialty : undefined,
      stack: selectedRole.id === 'freelancer' ? stack : undefined,
      provider: pendingAccount?.provider || (accountUser?.email === email ? 'google' : 'manual'),
    }

    setPendingAccount(payload)
    setMessage('Enviando código de verificación...')

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo enviar el código.')
      }

      setAuthStep('verify')
      setMessage(
        data?.dev_code
          ? `Código enviado. Código de prueba: ${data.dev_code}`
          : 'Código enviado correctamente. Revisa tu correo.'
      )
    } catch (error) {
      setMessage(error.message || 'No se pudo enviar el código.')
    }
  }

  async function handleVerificationSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const code = String(formData.get('verification-code') ?? '').trim()
    const email = pendingAccount?.email || String(formData.get('verification-email') ?? '').trim().toLowerCase()

    if (!email) {
      setMessage('No se encontró el correo para verificar.')
      return
    }

    if (!/^\d{6}$/.test(code)) {
      setMessage('El código debe tener 6 dígitos.')
      return
    }

    try {
      setMessage('Verificando código...')
      const response = await fetch(`${getApiBaseUrl()}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Código incorrecto o vencido.')
      }

      const accountPayload = {
        email,
        name: pendingAccount?.name || email.split('@', 1)[0] || 'Usuario',
        role: pendingAccount?.role || selectedRole.name,
        phone: pendingAccount?.phone || '',
        password: pendingAccount?.password || '',
        accountType: pendingAccount?.accountType,
        location: pendingAccount?.location || '',
        specialty: pendingAccount?.specialty,
        stack: pendingAccount?.stack,
        provider: pendingAccount?.provider || 'manual',
      }

      const createAccountResponse = await fetch(`${getApiBaseUrl()}/api/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountPayload),
      })

      const createAccountData = await createAccountResponse.json()

      if (!createAccountResponse.ok) {
        throw new Error(createAccountData?.error || 'No se pudo crear la cuenta.')
      }

      const nextUser = {
        name: accountPayload.name,
        email,
        avatar: buildAvatarUrl(accountPayload.name, email),
        role: accountPayload.role,
      }

      setAccountUser(nextUser)
      setPendingAccount(null)
      setAuthStep('login')
      setView('landing')
      setMessage('Correo verificado. Bienvenido a jj.dev.pe.')
    } catch (error) {
      setMessage(error.message || 'No se pudo verificar el código.')
    }
  }

  function handleProfileAction(action) {
    setIsProfileMenuOpen(false)

    if (action === 'logout') {
      setAccountUser(null)
      setMessage('Sesión cerrada.')
      return
    }

    setMessage(action === 'profile' ? 'Demo: aquí aparecerá tu perfil.' : 'Demo: aquí podrás subir una publicación.')
  }

  function handleEnterLogin() {
    setIsEnteringLogin(true)
    setActiveSlide(0)

    window.setTimeout(() => {
      setView('login')
      setIsEnteringLogin(false)
    }, 2100)
  }

  function handleBackToLanding() {
    setView('landing')
    setAuthStep('login')
    setMessage('')
  }

  function handlePanelBack() {
    if (authStep === 'login') {
      handleBackToLanding()
      return
    }

    if (authStep === 'roles') {
      setAuthStep('login')
      setMessage('')
      return
    }

    if (authStep === 'role-form') {
      setAuthStep('roles')
      setMessage('')
      return
    }

    if (authStep === 'verify') {
      setAuthStep('role-form')
      setMessage('')
      return
    }

    handleBackToLanding()
  }

  return (
    <div className="app-shell">
      {isEnteringLogin && (
        <div className="login-transition-screen" aria-live="polite">
          <div className="login-transition-stage" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className={`transition-box box-${index}`} />
            ))}
            <span className="transition-portal" />
          </div>

          <div className="transition-brand">
            <span className="transition-brand-main">Kodvex</span>
            <span className="transition-brand-side">jj.dev.pe</span>
          </div>

          <p className="transition-status">ingresando al login</p>
        </div>
      )}
      {view === 'landing' ? (
        <div className="landing-page">
          <header className="topbar">
            <div className="brand" aria-label="Kodvex">
              <span>K</span>
              <span>odvex</span>
            </div>

            <nav className="main-nav" aria-label="Navegación principal">
              <a href="#inicio">Inicio</a>
              <a href="#conocenos">Conócenos</a>
              <a href="#busqueda">Búsqueda</a>
            </nav>

            <div className="header-actions">
              <a className="contact-button" href="#contacto">
                Contacto
              </a>
              {accountUser ? (
                <div className="account-menu-wrap">
                  <button
                    type="button"
                    className="profile-trigger"
                    onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="menu"
                  >
                    <img src={accountUser.avatar} alt="" className="profile-avatar" />
                    <span>{accountUser.name}</span>
                    <span className="profile-chevron" aria-hidden="true">⌄</span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="account-menu" role="menu">
                      <p>{accountUser.role}</p>
                      <button type="button" role="menuitem" onClick={() => handleProfileAction('profile')}>
                        Ver perfil
                      </button>
                      <button type="button" role="menuitem" onClick={() => handleProfileAction('publish')}>
                        Subir publicación
                      </button>
                      <button type="button" role="menuitem" className="logout-action" onClick={() => handleProfileAction('logout')}>
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" className="login-link" onClick={handleEnterLogin}>
                  <span className="button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path d="M10 7.5V4.75A1.75 1.75 0 0 1 11.75 3h5.5A1.75 1.75 0 0 1 19 4.75v14.5A1.75 1.75 0 0 1 17.25 21h-5.5A1.75 1.75 0 0 1 10 19.25V16.5M3 12h11m0 0-3.5-3.5M14 12l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="button-label">Ingresar</span>
                </button>
              )}
            </div>
          </header>

          <main>
            <section className="hero" id="inicio">
              <div className="hero-copy">
                <p className="eyebrow">desarrollo de software • programas listos para usar</p>
                <h1>
                  Encuentra el software o proyecto que tu negocio necesita para avanzar.
                </h1>
                <p className="hero-text">
                  Desarrollo profesional de páginas web, apps de escritorio, sistemas para negocios y soluciones a medida.
                  Todo pensado para ayudarte a vender mejor, operar con orden y crecer con confianza.
                </p>

                <div className="search-panel" id="busqueda">
                  <div className="search-input-wrap">
                    <span className="search-icon" aria-hidden="true">
                      ⌕
                    </span>
                    <input
                      type="text"
                      aria-label="Buscar proyectos"
                      placeholder="Busca por tipo de proyecto, industria o necesidad"
                    />
                  </div>
                  <button type="button">Buscar</button>
                </div>

                <div className="chip-row" aria-label="Categorías">
                  {categories.map((category) => (
                    <button type="button" key={category} className="chip">
                      {category}
                    </button>
                  ))}
                </div>

                <div className="hero-stats" aria-label="Estadísticas">
                  <div>
                    <strong>60+</strong>
                    <span>soluciones entregadas</span>
                  </div>
                  <div>
                    <strong>4.9/5</strong>
                    <span>calificación de clientes</span>
                  </div>
                  <div>
                    <strong>1:1</strong>
                    <span>asesoría personalizada</span>
                  </div>
                </div>
              </div>

              <div className="hero-visual" aria-label="Vista previa de proyectos">
                <div className="preview-card large">
                  <div className="preview-header">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <div className="preview-body">
                    <div className="mini-surface">
                      <div className="bar bar-one" />
                      <div className="bar bar-two" />
                      <div className="bar bar-three" />
                    </div>
                    <div className="mini-metrics">
                      <div>
                        <small>Ventas</small>
                        <strong>+42%</strong>
                      </div>
                      <div>
                        <small>Leads</small>
                        <strong>1,240</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="floating-card card-top">
                  <span>Proyecto destacado</span>
                  <strong>SIS Gestión</strong>
                  <small>Panel administrativo + reportes</small>
                </div>

                <div className="floating-card card-bottom">
                  <span>Entrega</span>
                  <strong>7 días</strong>
                  <small>Soporte incluido</small>
                </div>
              </div>
            </section>

            <section className="projects-section">
              <div className="section-heading">
                <p className="eyebrow">catálogo</p>
                <h2>Proyectos listos para comprar o adaptar.</h2>
              </div>

              <div className="project-grid">
                {projects.map((project) => (
                  <article key={project.name} className="project-card">
                    <div className="project-image-wrap">
                      <img src={project.image} alt={project.name} />
                      <span className="project-category">{project.category}</span>
                    </div>

                    <div className="project-body">
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span>{project.price}</span>
                      </div>

                      <p>{project.description}</p>

                      <div className="project-tags">
                        {project.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      <div className="project-actions">
                        <button type="button" className="primary-action">
                          Ver detalle
                        </button>
                        <button type="button" className="secondary-action">
                          Contactar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="process-section">
              <div className="section-heading centered">
                <p className="eyebrow">cómo funciona</p>
                <h2>Un proceso simple, claro y pensado para entregar resultados.</h2>
              </div>

              <div className="steps-grid">
                {steps.map((step) => (
                  <div key={step.number} className="step-card">
                    <span className="step-number">{step.number}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="about-section" id="conocenos">
              <div className="about-image">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
                  alt="Desarrollador Kodvex"
                />
              </div>

              <div className="about-copy">
                <p className="eyebrow">conócenos</p>
                <h2>Desarrollo real, con visión de negocio y atención cercana.</h2>
                <p>
                  Soy <strong>Kodvex</strong>, un desarrollador de software con enfoque práctico en soluciones que
                  realmente ayudan a las personas y a los negocios a operar mejor. Actualmente estudio desarrollo de software
                  y ya he tenido la oportunidad de trabajar en un proyecto en producción, lo que me ha permitido aprender
                  mucho sobre entrega, mejora continua y resolución de problemas reales.
                </p>
                <p>
                  Mi objetivo es crear herramientas útiles, limpias y escalables, combinando diseño moderno, lógica sólida y
                  comunicación clara con cada cliente.
                </p>
                <div className="about-pills">
                  <span>Estudiante de desarrollo</span>
                  <span>Proyecto en producción</span>
                  <span>Soporte real</span>
                </div>
              </div>
            </section>

            <section className="cta-section" id="contacto">
              <div>
                <p className="eyebrow">listo para empezar</p>
                <h2>Hablemos de tu próximo proyecto o del software que necesitas.</h2>
              </div>

              <div className="cta-actions">
                <a href="https://wa.me/51999999999" target="_blank" rel="noreferrer">
                  Contactar por WhatsApp
                </a>
                <a href="mailto:hola@kodvex.com" className="secondary-cta">
                  hola@kodvex.com
                </a>
              </div>
            </section>
          </main>

          <footer className="site-footer">
            <div className="brand" aria-label="Kodvex">
              <span>K</span>
              <span>odvex</span>
            </div>
            <p>© 2026 Kodvex — Desarrollo de software y soluciones para negocios.</p>
          </footer>
        </div>
      ) : (
        <main
          className="auth-page"
          style={{
            '--accent': authSlides[activeSlide].accent,
            '--accent-2': authSlides[activeSlide].accent2,
            '--ink': authSlides[activeSlide].ink,
            '--muted': authSlides[activeSlide].muted,
          }}
        >
          <div className="page-video" aria-hidden="true">
            <video
              key={authSlides[activeSlide].video}
              ref={videoRef}
              autoPlay
              playsInline
              preload="auto"
              poster={authSlides[activeSlide].poster}
              src={authSlides[activeSlide].video}
            />
            <div className="video-overlay" />
          </div>

          <section className="login-panel" aria-labelledby="login-title">
            <button
              type="button"
              className="panel-exit-button"
              onClick={handlePanelBack}
              aria-label={authStep === 'login' ? 'Volver a la página principal' : 'Volver al paso anterior'}
            >
              <span aria-hidden="true">⟵</span>
              <span>{authStep === 'login' ? 'Salir' : 'Volver'}</span>
            </button>

            <div className="login-content">
              <div className="brand-mark" aria-label="Kodvex">
                <span className="brand-main">Kodvex</span>
                <span className="brand-side">jj.dev.pe</span>
              </div>

              {authStep === 'login' && (
                <div className="login-heading">
                  <p className="kicker">software para avanzar</p>
                  <h1 id="login-title">
                    Bienvenido<br />
                    <em>de vuelta.</em>
                  </h1>
                  <p className="intro-copy">Ingresa a tu espacio y sigue construyendo ideas que importan.</p>
                </div>
              )}

              {authStep === 'login' && (
                <>
                  <form className="login-form" onSubmit={handleLoginSubmit}>
                    <label htmlFor="email">Correo electrónico</label>
                    <input id="email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" required />

                    <div className="password-label">
                      <label htmlFor="password">Contraseña</label>
                      <a href="#forgot">¿La olvidaste?</a>
                    </div>
                    <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />

                    <button type="submit">Entrar <span aria-hidden="true">↗</span></button>
                  </form>

                  <div className="separator">
                    <span>o continúa con Google</span>
                  </div>

                  <div className="social-auth">
                    <button type="button" className="gmail-button" onClick={handleGoogleLogin}>
                      Ingresar con Gmail
                    </button>
                  </div>

                  <p className="signup">
                    ¿Todavía no tienes cuenta?{' '}
                    <button type="button" className="text-button" onClick={handleCreateAccount}>
                      Crear una cuenta
                    </button>
                  </p>
                </>
              )}

              {authStep === 'roles' && (
                <div className="role-selector">
                  <p className="kicker">crea tu cuenta</p>
                  <h2>¿Cómo quieres participar en Kodvex?</h2>

                  <div className="role-grid">
                    {accountRoles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        className="role-card"
                        onClick={() => handleSelectRole(role)}
                      >
                        <span className="role-tag">{role.tag}</span>
                        <strong>{role.name}</strong>
                        <small>{role.description}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {authStep === 'role-form' && (
                <form className="role-form" onSubmit={handleRoleSubmit}>
                  <p className="kicker">cuenta demo</p>
                  <h2>
                    Crear cuenta como <span>{selectedRole.name}</span>
                  </h2>
                  <p className="role-intro">{selectedRole.description}</p>

                  <label htmlFor="role-name">Nombre completo</label>
                  <input
                    id="role-name"
                    name="role-name"
                    type="text"
                    placeholder="Tu nombre"
                    defaultValue={pendingAccount?.name || accountUser?.name || ''}
                    required
                  />

                  <label htmlFor="role-email">Correo electrónico</label>
                  <input
                    id="role-email"
                    name="role-email"
                    type="email"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    defaultValue={pendingAccount?.email || accountUser?.email || ''}
                    readOnly={Boolean(accountUser?.email || pendingAccount?.provider === 'google')}
                    required
                  />

                  <label htmlFor="role-password">Contraseña</label>
                  <input
                    id="role-password"
                    name="role-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <label htmlFor="role-phone">Teléfono</label>
                  <input
                    id="role-phone"
                    name="role-phone"
                    type="tel"
                    placeholder="+51 999 999 999"
                    defaultValue={pendingAccount?.phone || ''}
                    required
                  />

                  {selectedRole.id === 'buyer' ? (
                    <>
                      <label htmlFor="role-account-type">Tipo de cuenta</label>
                      <select
                        id="role-account-type"
                        name="role-account-type"
                        defaultValue={pendingAccount?.accountType || 'persona-natural'}
                        required
                      >
                        <option value="persona-natural">Persona natural</option>
                        <option value="empresa">Empresa</option>
                      </select>

                      <label htmlFor="role-location">País / ciudad</label>
                      <input
                        id="role-location"
                        name="role-location"
                        type="text"
                        placeholder="Perú, Lima"
                        defaultValue={pendingAccount?.location || ''}
                        required
                      />
                    </>
                  ) : (
                    <>
                      <label htmlFor="role-specialty">Título profesional o especialidad</label>
                      <input
                        id="role-specialty"
                        name="role-specialty"
                        type="text"
                        placeholder="Full Stack Developer"
                        defaultValue={pendingAccount?.specialty || ''}
                        required
                      />

                      <label htmlFor="role-stack">Stack tecnológico principal</label>
                      <input
                        id="role-stack"
                        name="role-stack"
                        type="text"
                        placeholder="React, Python, PHP"
                        defaultValue={pendingAccount?.stack || ''}
                        required
                      />

                      <label htmlFor="role-location">País / ciudad</label>
                      <input
                        id="role-location"
                        name="role-location"
                        type="text"
                        placeholder="Perú, Lima"
                        defaultValue={pendingAccount?.location || ''}
                        required
                      />
                    </>
                  )}

                  <label className="checkbox-label" htmlFor="terms-accepted">
                    <input id="terms-accepted" name="terms-accepted" type="checkbox" required />
                    <span>
                      Acepto los <a href="/terms.html" target="_blank" rel="noreferrer">términos y condiciones</a> y la{' '}
                      <a href="/privacy.html" target="_blank" rel="noreferrer">política de privacidad</a>
                    </span>
                  </label>

                  <button type="submit" className="primary-cta role-submit">
                    Crear cuenta
                  </button>
                </form>
              )}

              {authStep === 'verify' && (
                <form className="role-form verification-form" onSubmit={handleVerificationSubmit}>
                  <p className="kicker">verificación de correo</p>
                  <h2>Confirma tu <span>correo</span></h2>
                  <p className="role-intro">
                    Escribe el código de 6 dígitos que enviamos a <strong>{pendingAccount?.email}</strong>.
                  </p>

                  <label htmlFor="verification-email">Correo</label>
                  <input
                    id="verification-email"
                    name="verification-email"
                    type="email"
                    value={pendingAccount?.email || ''}
                    readOnly
                    disabled
                  />

                  <label htmlFor="verification-code">Código de verificación</label>
                  <input
                    id="verification-code"
                    name="verification-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="123456"
                    autoComplete="one-time-code"
                    required
                  />
                  <button type="submit" className="primary-cta role-submit">
                    Verificar cuenta
                  </button>
                </form>
              )}

              {message && <p className="form-message" role="status">{message}</p>}
            </div>

            <p className="legal">
              © 2026 jj.dev.pe <span>•</span> <a href="/terms.html">Términos</a> <span>•</span>{' '}
              <a href="/privacy.html">Privacidad</a>
            </p>
          </section>

          <section className="promo-panel" aria-label={authSlides[activeSlide].title}>
            <div className="promo-copy">
              <div className="promo-slide" key={`${activeSlide}`}>
                <p className="kicker">{authSlides[activeSlide].kicker}</p>
                <h2>
                  {authSlides[activeSlide].title}
                  <br />
                  <strong>{authSlides[activeSlide].highlight}</strong>
                </h2>
                <p>{authSlides[activeSlide].description}</p>
              </div>

              <div className="promo-actions">
                <button type="button" className="primary-cta">
                  Ver soluciones
                </button>
                <button type="button" className="secondary-cta">
                  Ver catálogo
                </button>
              </div>

              <div className="promo-dots" aria-label="Seleccionar presentación">
                {authSlides.map((slide, index) => (
                  <button
                    key={`${slide.title}-${index}`}
                    className={index === activeSlide ? 'is-active' : ''}
                    type="button"
                    aria-label={`Ver presentación ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                  />
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
