import { useEffect, useRef, useState } from 'react'
import './App.css'

const travelSlides = [
  {
    kicker: 'Explora lo extraordinario',
    title: 'Rutas turísticas',
    highlight: 'por todo Cusco.',
    description: 'Descubre historias, paisajes y experiencias que se quedan contigo. Diseña viajes memorables y encuentra el Perú que quieres vivir.',
    location: 'Valle Sagrado · Machu Picchu',
    routes: '120+',
    rating: '4.9★',
  },
  {
    kicker: 'Viaja con intención',
    title: 'Historias que',
    highlight: 'merecen un desvío.',
    description: 'Camina entre montañas, mercados y pueblos vivos. Cada ruta tiene un ritmo propio y una nueva forma de mirar el paisaje.',
    location: 'Pisac · Chinchero · Maras',
    routes: '86+',
    rating: '4.8★',
  },
  {
    kicker: 'El Perú que imaginas',
    title: 'Haz espacio para',
    highlight: 'lo inesperado.',
    description: 'Planifica escapadas con carácter, encuentra lugares singulares y deja que el viaje se convierta en tu mejor historia.',
    location: 'Laguna Humantay · Ausangate',
    routes: '64+',
    rating: '4.9★',
  },
]

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isLoaderReady, setIsLoaderReady] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isTravelEnding, setIsTravelEnding] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(false)
  const [message, setMessage] = useState('')
  const logoAudioRef = useRef(null)

  useEffect(() => {
    if (!isLoading) return undefined

    const audio = logoAudioRef.current
    if (!audio) return undefined

    audio.volume = 0.7
    audio.load()
    audio.currentTime = 0
    const playLogoAudio = () => audio.play().then(() => setIsSoundEnabled(true)).catch(() => {})
    const retryLogoAudio = () => {
      if (audio.paused) playLogoAudio()
    }

    if (audio.readyState >= 2) {
      playLogoAudio()
    } else {
      audio.addEventListener('canplay', playLogoAudio, { once: true })
    }
    window.addEventListener('pageshow', retryLogoAudio)
    document.addEventListener('visibilitychange', retryLogoAudio)

    return () => {
      audio.removeEventListener('canplay', playLogoAudio)
      window.removeEventListener('pageshow', retryLogoAudio)
      document.removeEventListener('visibilitychange', retryLogoAudio)
      audio.pause()
      audio.currentTime = 0
    }
  }, [isLoading])

  useEffect(() => {
    const loaderTimer = setTimeout(() => setIsLoaderReady(true), 3800)
    return () => clearTimeout(loaderTimer)
  }, [])

  useEffect(() => {
    if (!isLoaderReady || !isVideoReady) return undefined

    setIsLeaving(true)
    const finishTimer = setTimeout(() => setIsLoading(false), 850)
    return () => clearTimeout(finishTimer)
  }, [isLoaderReady, isVideoReady])

  useEffect(() => {
    if (isLoading) return undefined

    const slideTimer = setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % travelSlides.length)
    }, 4000)
    const endingTimer = setTimeout(() => setIsTravelEnding(true), 10000)
    return () => {
      clearInterval(slideTimer)
      clearTimeout(endingTimer)
    }
  }, [isLoading])

  function handleVideoReady() {
    setIsVideoReady(true)
    }

  function handleFirstInteraction() {
    const audio = logoAudioRef.current
    if (audio?.paused) audio.play().then(() => setIsSoundEnabled(true)).catch(() => {})
  }

  function handleEnableSound(event) {
    event.stopPropagation()
    const audio = logoAudioRef.current
    if (!audio) return

    audio.currentTime = 0
    audio.play().then(() => setIsSoundEnabled(true)).catch(() => {})
  }

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('Demo lista: conecta aquí tu proveedor de autenticación.')
  }

  return (
    <div onClick={handleFirstInteraction}>
      <audio autoPlay ref={logoAudioRef} preload="auto" src="https://res.cloudinary.com/neluxxvk/video/upload/v1789072980/Efecto_de_sonido_para_entrada_de_logo.mp3" />
      {isLoading && <main className={`loading-screen${isLeaving ? ' is-leaving' : ''}`} aria-label="Cargando jj.dev.pe">
        <div className="loading-stage" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => <i key={index} className={`loading-box box-${index}`} />)}
          <div className="loading-portal" />
        </div>
        <div className="loading-brand"><span>jj</span><b>.</b><span>dev</span><b>.</b><span>pe</span></div>
        <p className="loading-status">preparando tu experiencia<span>_</span></p>
        {!isSoundEnabled && <button className="loading-sound" type="button" onClick={handleEnableSound}>Activar sonido <span aria-hidden="true">♪</span></button>}
      </main>}
      <main className={`auth-page${isTravelEnding ? ' is-ad-ended' : ''}`}>
      <div className="page-video" aria-hidden="true">
        <video autoPlay muted loop playsInline preload="auto" onCanPlay={handleVideoReady} poster="https://res.cloudinary.com/neluxxvk/video/upload/so_0/v1788814448/Peru_Cinematic_Video_4K_-_Jotapegerd_1080p_h264.jpg" src="https://res.cloudinary.com/neluxxvk/video/upload/v1788814448/Peru_Cinematic_Video_4K_-_Jotapegerd_1080p_h264.mp4" />
      </div>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-content">
          <a className="brand-mark" href="/" aria-label="jj.dev.pe">
            <span>jj</span><b>.</b><span>dev</span><b>.</b><span>pe</span>
          </a>
          <div className="login-heading">
            <p className="kicker">software para avanzar</p>
            <h1 id="login-title">Bienvenido<br /><em>de vuelta.</em></h1>
            <p className="intro-copy">Ingresa a tu espacio y sigue construyendo ideas que importan.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" required />
            <div className="password-label"><label htmlFor="password">Contraseña</label><a href="#forgot">¿La olvidaste?</a></div>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
            <button type="submit">Entrar <span aria-hidden="true">↗</span></button>
            {message && <p className="form-message" role="status">{message}</p>}
          </form>
          <p className="signup">¿Todavía no tienes cuenta? <a href="#signup">Crear una cuenta</a></p>
        </div>
        <p className="legal">© 2026 jj.dev.pe <span>•</span> Hecho para crear</p>
      </section>
      <section className={`travel-panel${isTravelEnding ? ' is-ending' : ''}`} aria-label="Rutas turísticas por todo Cusco">
        <div className="travel-copy">
          <div className="travel-slide" key={activeSlide}>
            <p className="kicker">{travelSlides[activeSlide].kicker}</p>
            <h2>{travelSlides[activeSlide].title}<br /><strong>{travelSlides[activeSlide].highlight}</strong></h2>
            <p>{travelSlides[activeSlide].description}</p>
          </div>
          <div className="travel-actions"><a href="#destinos">Explorar destinos <span>↗</span></a><a href="#experiencias">Ver experiencias</a></div>
          <div className="travel-meta"><span>0{activeSlide + 1}</span><i /><span>{travelSlides[activeSlide].location}</span></div>
          <div className="travel-stats"><strong>{travelSlides[activeSlide].routes}</strong><small>rutas para descubrir</small><strong>{travelSlides[activeSlide].rating}</strong><small>valoración viajera</small></div>
          <div className="travel-dots" aria-label="Seleccionar experiencia">
            {travelSlides.map((slide, index) => <button key={slide.title} className={index === activeSlide ? 'is-active' : ''} type="button" aria-label={`Ver experiencia ${index + 1}`} onClick={() => setActiveSlide(index)} />)}
          </div>
        </div>
        <div className="travel-corner">CUSCO / PERÚ<br /><span>13°31′S 71°58′W</span></div>
      </section>
      </main>
    </div>
  )
}

export default App
