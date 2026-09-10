import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

const adSlides = [
  {
    theme: 'theme-travel',
    video: 'https://res.cloudinary.com/neluxxvk/video/upload/v1788814448/Peru_Cinematic_Video_4K_-_Jotapegerd_1080p_h264.mp4',
    poster: 'https://res.cloudinary.com/neluxxvk/video/upload/so_0/v1788814448/Peru_Cinematic_Video_4K_-_Jotapegerd_1080p_h264.jpg',
    kicker: 'Explora lo extraordinario',
    title: 'Rutas turísticas',
    highlight: 'por todo Cusco.',
    description: 'Descubre historias, paisajes y experiencias que se quedan contigo. Diseña viajes memorables y encuentra el Perú que quieres vivir.',
    location: 'Valle Sagrado · Machu Picchu',
    routes: '120+',
    rating: '4.9★',
    primaryAction: 'Explorar destinos',
    secondaryAction: 'Ver experiencias',
    statLabel: 'rutas para descubrir',
    ratingLabel: 'valoración viajera',
    corner: 'CUSCO / PERÚ',
    coordinates: '13°31′S 71°58′W',
    copyVariants: [
      { kicker: 'Explora lo extraordinario', title: 'Rutas turísticas', highlight: 'por todo Cusco.', description: 'Descubre historias, paisajes y experiencias que se quedan contigo. Diseña viajes memorables y encuentra el Perú que quieres vivir.' },
      { kicker: 'Viaja con intención', title: 'Historias que', highlight: 'merecen un desvío.', description: 'Camina entre montañas, mercados y pueblos vivos. Cada ruta tiene un ritmo propio y una nueva forma de mirar el paisaje.' },
      { kicker: 'El Perú que imaginas', title: 'Haz espacio para', highlight: 'lo inesperado.', description: 'Planifica escapadas con carácter, encuentra lugares singulares y deja que el viaje se convierta en tu mejor historia.' },
    ],
  },
  {
    theme: 'theme-restaurant',
    video: 'https://res.cloudinary.com/neluxxvk/video/upload/v1788837162/Restaurant_Ad_Video_Template_Editable_-_Biteable_1080p_h264.mp4',
    poster: 'https://res.cloudinary.com/neluxxvk/video/upload/so_0/v1788837162/Restaurant_Ad_Video_Template_Editable_-_Biteable_1080p_h264.jpg',
    clipEnd: 9.6,
    kicker: 'Una mesa para recordar',
    title: 'Cocina de autor',
    highlight: 'con alma peruana.',
    description: 'Sabores de temporada, producto local y una carta pensada para quedarse en la memoria. Una experiencia íntima para celebrar lo extraordinario.',
    location: 'Cusco · Perú',
    routes: '18:30',
    rating: '4.9★',
    primaryAction: 'Reservar una mesa',
    secondaryAction: 'Ver la carta',
    statLabel: 'primera reserva',
    ratingLabel: 'experiencia de mesa',
    corner: 'CUSCO / PERÚ',
    coordinates: '13°31′S 71°58′W',
    copyVariants: [
      { kicker: 'Una mesa para recordar', title: 'Cocina de autor', highlight: 'con alma peruana.', description: 'Sabores de temporada, producto local y una carta pensada para quedarse en la memoria. Una experiencia íntima para celebrar lo extraordinario.' },
      { kicker: 'El ritual de cada noche', title: 'Sabores que', highlight: 'despiertan los sentidos.', description: 'Del primer aroma al último brindis, cada detalle está creado para disfrutar sin prisa y compartir una noche verdaderamente especial.' },
      { kicker: 'Tu próxima gran noche', title: 'Reserva tu mesa', highlight: 'para lo extraordinario.', description: 'Ven a descubrir una cocina cálida, elegante y honesta. Tu mesa está lista para convertirse en el comienzo de una gran historia.' },
    ],
  },
  {
    theme: 'theme-car',
    video: 'https://res.cloudinary.com/neluxxvk/video/upload/v1788837681/BMW_M3_Competition_-_4K_Cinematic_Short_Video_-_Damir_Who_1080p_h264.mp4',
    poster: 'https://res.cloudinary.com/neluxxvk/video/upload/so_0/v1788837681/BMW_M3_Competition_-_4K_Cinematic_Short_Video_-_Damir_Who_1080p_h264.jpg',
    kicker: 'Diseñado para dejar huella',
    title: 'BMW M3',
    highlight: 'nacido para avanzar.',
    description: 'Potencia, precisión y una presencia imposible de ignorar. Conoce la máquina que convierte cada trayecto en una experiencia.',
    location: 'M Competition · 510 CV',
    routes: '3.5s',
    rating: 'M',
    primaryAction: 'Conoce el BMW M3',
    secondaryAction: 'Ver especificaciones',
    statLabel: '0 a 100 km/h',
    ratingLabel: 'm performance',
    corner: 'BMW M / PERFORMANCE',
    coordinates: 'MUNICH · DE 48°08′N',
    copyVariants: [
      { kicker: 'Diseñado para dejar huella', title: 'BMW M3', highlight: 'nacido para avanzar.', description: 'Potencia, precisión y una presencia imposible de ignorar. Conoce la máquina que convierte cada trayecto en una experiencia.' },
      { kicker: 'El placer de conducir', title: 'Más que un auto,', highlight: 'una declaración.', description: 'Siente la respuesta inmediata, el control absoluto y la emoción de una máquina creada para quienes exigen más.' },
      { kicker: 'No sigas el camino', title: 'Haz que cada curva', highlight: 'cuente una historia.', description: 'Diseño atlético, ingeniería alemana y el carácter M que transforma cada kilómetro en una experiencia inolvidable.' },
    ],
  },
]

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isLoaderReady, setIsLoaderReady] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeCopy, setActiveCopy] = useState(0)
  const [isAdTransitioning, setIsAdTransitioning] = useState(false)
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
      changeAdSlide((activeSlide + 1) % adSlides.length)
    }, 10000)
    return () => {
      clearInterval(slideTimer)
    }
  }, [isLoading, activeSlide])

  useEffect(() => {
    if (isLoading) return undefined

    const copyTimer = setInterval(() => {
      setActiveCopy((currentCopy) => (currentCopy + 1) % adSlides[activeSlide].copyVariants.length)
    }, 3000)
    return () => clearInterval(copyTimer)
  }, [isLoading, activeSlide])

  const changeAdSlide = useCallback((nextSlide) => {
    if (nextSlide === activeSlide || isAdTransitioning) return

    setIsAdTransitioning(true)
    setTimeout(() => {
      setActiveSlide(nextSlide)
      setActiveCopy(0)
    }, 500)
    setTimeout(() => setIsAdTransitioning(false), 1000)
  }, [activeSlide, isAdTransitioning])

  function handleVideoReady() {
    setIsVideoReady(true)
    }

  function handleVideoTimeUpdate(event) {
    const clipEnd = adSlides[activeSlide].clipEnd
    if (clipEnd && !event.currentTarget.paused && event.currentTarget.currentTime >= clipEnd) {
      event.currentTarget.pause()
      event.currentTarget.currentTime = clipEnd
      changeAdSlide((activeSlide + 1) % adSlides.length)
    }
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
      <main className={`auth-page ${adSlides[activeSlide].theme}${isAdTransitioning ? ' is-ad-transitioning' : ''}`}>
      <div className="page-video" aria-hidden="true">
        <video key={adSlides[activeSlide].video} autoPlay muted loop playsInline preload="auto" onCanPlay={handleVideoReady} onTimeUpdate={handleVideoTimeUpdate} poster={adSlides[activeSlide].poster} src={adSlides[activeSlide].video} />
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
      <section className="travel-panel" aria-label={adSlides[activeSlide].title}>
        <div className="travel-copy">
          <div className="travel-slide" key={`${activeSlide}-${activeCopy}`}>
            <p className="kicker">{adSlides[activeSlide].copyVariants[activeCopy].kicker}</p>
            <h2>{adSlides[activeSlide].copyVariants[activeCopy].title}<br /><strong>{adSlides[activeSlide].copyVariants[activeCopy].highlight}</strong></h2>
            <p>{adSlides[activeSlide].copyVariants[activeCopy].description}</p>
          </div>
          <div className="travel-actions"><a href="#primary">{adSlides[activeSlide].primaryAction} <span>↗</span></a><a href="#secondary">{adSlides[activeSlide].secondaryAction}</a></div>
          <div className="travel-meta"><span>0{activeSlide + 1}</span><i /><span>{adSlides[activeSlide].location}</span></div>
          <div className="travel-stats"><strong>{adSlides[activeSlide].routes}</strong><small>{adSlides[activeSlide].statLabel}</small><strong>{adSlides[activeSlide].rating}</strong><small>{adSlides[activeSlide].ratingLabel}</small></div>
          <div className="travel-dots" aria-label="Seleccionar experiencia">
            {adSlides.map((slide, index) => <button key={`${slide.title}-${index}`} className={index === activeSlide ? 'is-active' : ''} type="button" aria-label={`Ver publicidad ${index + 1}`} onClick={() => changeAdSlide(index)} />)}
          </div>
        </div>
        <div className="travel-corner">{adSlides[activeSlide].corner}<br /><span>{adSlides[activeSlide].coordinates}</span></div>
      </section>
      </main>
    </div>
  )
}

export default App
