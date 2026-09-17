import { useState } from 'react'
import {
  DEFAULT_PROFILE,
  PRESET_BANNERS,
  PRESET_AVATARS,
  SKILL_SUGGESTIONS,
} from './profileData'
import './ProfilePage.css'

export default function ProfilePage({ user, onUpdateUser, onBackToHome, onLogout }) {
  // Ensure profile has default values
  const profileData = {
    ...DEFAULT_PROFILE,
    ...(user || {}),
    stats: {
      ...DEFAULT_PROFILE.stats,
      ...(user?.stats || {}),
    },
    skills: user?.skills && user.skills.length > 0 ? user.skills : DEFAULT_PROFILE.skills,
    projects: user?.projects && user.projects.length > 0 ? user.projects : DEFAULT_PROFILE.projects,
    services: user?.services && user.services.length > 0 ? user.services : DEFAULT_PROFILE.services,
  }

  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(profileData)
  const [newSkillInput, setNewSkillInput] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [showBannerPicker, setShowBannerPicker] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showAddProjectModal, setShowAddProjectModal] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // New project modal state
  const [newProject, setNewProject] = useState({
    name: '',
    category: 'Páginas web',
    price: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    tags: 'React, Vite',
    link: '',
  })

  function showToast(msg) {
    setToastMessage(msg)
    window.setTimeout(() => {
      setToastMessage('')
    }, 3500)
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)
  }

  function handleAddSkill(skillToAdd) {
    const trimmed = (skillToAdd || newSkillInput).trim()
    if (!trimmed) return

    if (formData.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Esa habilidad ya está en tu lista.')
      return
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }))
    setNewSkillInput('')
    setHasChanges(true)
  }

  function handleRemoveSkill(skillToRemove) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }))
    setHasChanges(true)
  }

  function handleSaveProfile() {
    onUpdateUser(formData)
    setHasChanges(false)
    setIsEditing(false)
    showToast('✨ ¡Perfil actualizado con éxito!')
  }

  function handleCancelEdit() {
    setFormData(profileData)
    setHasChanges(false)
    setIsEditing(false)
    showToast('Cambios revertidos.')
  }

  function handleAddProjectSubmit(e) {
    e.preventDefault()
    if (!newProject.name.trim()) {
      showToast('Ingresa el nombre del proyecto.')
      return
    }

    const tagsArray = newProject.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const created = {
      id: `p_${Date.now()}`,
      name: newProject.name.trim(),
      category: newProject.category,
      price: newProject.price.trim() || 'A consultar',
      description: newProject.description.trim(),
      image: newProject.image.trim() || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
      tags: tagsArray.length > 0 ? tagsArray : ['Web'],
      link: newProject.link.trim() || '#',
    }

    const updatedProjects = [created, ...(formData.projects || [])]
    setFormData((prev) => ({
      ...prev,
      projects: updatedProjects,
      stats: {
        ...prev.stats,
        projectsCount: updatedProjects.length,
      },
    }))
    onUpdateUser({
      ...formData,
      projects: updatedProjects,
      stats: {
        ...formData.stats,
        projectsCount: updatedProjects.length,
      },
    })
    setShowAddProjectModal(false)
    setNewProject({
      name: '',
      category: 'Páginas web',
      price: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
      tags: 'React, Vite',
      link: '',
    })
    showToast('🚀 Proyecto añadido al portafolio con éxito.')
  }

  function handleDeleteProject(projectId) {
    const updatedProjects = formData.projects.filter((p) => p.id !== projectId)
    setFormData((prev) => ({
      ...prev,
      projects: updatedProjects,
      stats: {
        ...prev.stats,
        projectsCount: updatedProjects.length,
      },
    }))
    onUpdateUser({
      ...formData,
      projects: updatedProjects,
      stats: {
        ...formData.stats,
        projectsCount: updatedProjects.length,
      },
    })
    showToast('Proyecto eliminado.')
  }

  function handleShareProfile() {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('🔗 Enlace de perfil copiado al portapapeles.')
    }
  }

  return (
    <div className="profile-page-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="profile-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Save Bar if changes exist in edit mode */}
      {isEditing && hasChanges && (
        <div className="profile-sticky-bar">
          <div className="sticky-bar-content">
            <div className="sticky-bar-info">
              <span className="dot-pulse" />
              <span>Tienes cambios sin guardar en tu perfil</span>
            </div>
            <div className="sticky-bar-actions">
              <button type="button" className="btn-cancel-mini" onClick={handleCancelEdit}>
                Descartar
              </button>
              <button type="button" className="btn-save-mini" onClick={handleSaveProfile}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="profile-topbar">
        <div className="profile-topbar-left">
          <button type="button" className="profile-back-btn" onClick={onBackToHome} aria-label="Volver al inicio">
            <span aria-hidden="true">←</span>
            <span>Volver al inicio</span>
          </button>
          <div className="profile-breadcrumb">
            <span className="brand-badge">KODVEX</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Mi Perfil</span>
          </div>
        </div>

        <div className="profile-topbar-right">
          <button
            type="button"
            className="profile-share-btn"
            onClick={handleShareProfile}
            title="Compartir enlace de perfil"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Compartir</span>
          </button>

          {!isEditing ? (
            <button
              type="button"
              className="profile-edit-toggle-btn"
              onClick={() => setIsEditing(true)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Editar perfil</span>
            </button>
          ) : (
            <div className="edit-actions-group">
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="profile-save-btn"
                onClick={handleSaveProfile}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Guardar cambios</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="profile-container">
        {/* Cover Banner */}
        <div className="profile-banner-wrap">
          <img
            src={formData.banner || DEFAULT_PROFILE.banner}
            alt="Portada de perfil"
            className="profile-banner-img"
          />
          <div className="profile-banner-gradient" />

          {isEditing && (
            <button
              type="button"
              className="banner-change-btn"
              onClick={() => setShowBannerPicker(true)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Cambiar portada</span>
            </button>
          )}
        </div>

        {/* Profile Card Header */}
        <section className="profile-card-header">
          <div className="avatar-and-actions">
            <div className="profile-avatar-container">
              <img
                src={formData.avatar || DEFAULT_PROFILE.avatar}
                alt={formData.name}
                className="profile-hero-avatar"
              />
              <span
                className={`availability-indicator ${formData.isAvailable ? 'is-available' : 'is-busy'}`}
                title={formData.isAvailable ? 'Disponible para proyectos' : 'Ocupado actualmente'}
              />

              {isEditing && (
                <button
                  type="button"
                  className="avatar-change-overlay"
                  onClick={() => setShowAvatarPicker(true)}
                  aria-label="Cambiar foto de perfil"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Cambiar</span>
                </button>
              )}
            </div>

            <div className="profile-badges-row">
              <span className="role-pill-badge">{formData.role || 'Programador / Freelancer'}</span>
              <span className="verified-badge" title="Cuenta verificada por Kodvex">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Verificado
              </span>
              {formData.isAvailable ? (
                <span className="available-pill">🟢 Disponible para proyectos</span>
              ) : (
                <span className="busy-pill">⚪ Ocupado en proyecto</span>
              )}
            </div>
          </div>

          {/* User Names & Headline */}
          <div className="profile-identity-info">
            {!isEditing ? (
              <>
                <h1 className="profile-user-name">{formData.name}</h1>
                <p className="profile-headline">{formData.headline}</p>
              </>
            ) : (
              <div className="profile-edit-header-inputs">
                <div className="input-group">
                  <label htmlFor="edit-name">Nombre completo</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Ej. Jheferson Escate"
                    className="profile-input"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="edit-headline">Titular profesional</label>
                  <input
                    id="edit-headline"
                    type="text"
                    value={formData.headline}
                    onChange={(e) => handleFieldChange('headline', e.target.value)}
                    placeholder="Ej. Full Stack Engineer & UI Architect"
                    className="profile-input"
                  />
                </div>

                <div className="input-row-2col">
                  <div className="input-group">
                    <label htmlFor="edit-role">Rol en Kodvex</label>
                    <select
                      id="edit-role"
                      value={formData.role}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                      className="profile-select"
                    >
                      <option value="Programador / Freelancer">Programador / Freelancer</option>
                      <option value="Comprador / Empresa">Comprador / Empresa</option>
                      <option value="Diseñador UI/UX">Diseñador UI/UX</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="edit-availability">Disponibilidad</label>
                    <select
                      id="edit-availability"
                      value={formData.isAvailable ? 'true' : 'false'}
                      onChange={(e) => handleFieldChange('isAvailable', e.target.value === 'true')}
                      className="profile-select"
                    >
                      <option value="true">🟢 Disponible para proyectos</option>
                      <option value="false">⚪ Ocupado en este momento</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metadata Bar */}
            <div className="profile-meta-tags">
              <span className="meta-item">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {formData.location || 'Perú'}
              </span>

              <span className="meta-item">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {formData.email}
              </span>

              {formData.phone && (
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {formData.phone}
                </span>
              )}

              <span className="meta-item">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Miembro desde {formData.memberSince || '2026'}
              </span>
            </div>

            {/* Social Links Row */}
            <div className="profile-social-links">
              {formData.github && (
                <a
                  href={formData.github.startsWith('http') ? formData.github : `https://${formData.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn github"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              )}

              {formData.linkedin && (
                <a
                  href={formData.linkedin.startsWith('http') ? formData.linkedin : `https://${formData.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn linkedin"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.59 1.59 0 1 0 0-3.18 1.59 1.59 0 0 0 0 3.18m1.4 9.74V9.96H5.06v8.54h2.8z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}

              {formData.website && (
                <a
                  href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn website"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>Sitio Web</span>
                </a>
              )}

              {formData.phone && (
                <a
                  href={`https://wa.me/${formData.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn whatsapp"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19-.09-1.12-.55-1.3-.61-.17-.07-.3-.1-.43.1-.12.19-.48.61-.59.73-.11.13-.22.14-.4.05-.19-.09-.79-.29-1.5-1.02-.55-.49-.93-1.1-.98-1.29-.05-.19 0-.29.09-.38.08-.09.19-.22.28-.33.09-.11.13-.19.19-.31.06-.13.03-.24-.01-.33-.05-.09-.43-1.03-.59-1.42-.15-.37-.31-.32-.43-.33-.11 0-.24-.01-.37-.01s-.33.05-.5.24c-.17.19-.66.65-.66 1.58s.68 1.83.77 1.96c.1.13 1.33 2.04 3.23 2.86.45.2.81.31 1.08.4.45.14.86.12 1.18.07.36-.05 1.12-.46 1.28-.9.16-.45.16-.83.11-.91-.04-.08-.17-.14-.36-.24z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="profile-stats-grid">
            <div className="stat-card">
              <span className="stat-value">{formData.projects?.length || formData.stats.projectsCount || 0}</span>
              <span className="stat-label">Proyectos</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{formData.stats.completedJobs || 14}+</span>
              <span className="stat-label">Trabajos entregados</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">⭐ {formData.stats.rating || '4.9'}</span>
              <span className="stat-label">Calificación</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">&lt; {formData.stats.responseHours || 1}h</span>
              <span className="stat-label">Tiempo respuesta</span>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="profile-tabs-nav" aria-label="Secciones del perfil">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">👤</span>
            <span>Sobre mí & Habilidades</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <span className="tab-icon">💼</span>
            <span>Portafolio ({formData.projects?.length || 0})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <span className="tab-icon">⚡</span>
            <span>Servicios & Tarifas</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="tab-icon">⚙️</span>
            <span>Ajustes & Cuenta</span>
          </button>
        </nav>

        {/* Tab 1: Overview & Bio */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-grid">
            <div className="overview-main-col">
              {/* Bio Section */}
              <div className="profile-section-card">
                <div className="section-card-header">
                  <h3>Biografía & Enfoque</h3>
                  {isEditing && <span className="editing-pill">Modo edición</span>}
                </div>

                {!isEditing ? (
                  <p className="bio-text">{formData.bio}</p>
                ) : (
                  <div className="bio-edit-wrap">
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      placeholder="Escribe una descripción profesional sobre ti, tus proyectos y experiencia..."
                      rows={5}
                      className="profile-textarea"
                    />
                    <span className="char-counter">{formData.bio?.length || 0} caracteres</span>
                  </div>
                )}
              </div>

              {/* Skills & Tech Stack Section */}
              <div className="profile-section-card">
                <div className="section-card-header">
                  <h3>Stack Tecnológico & Habilidades</h3>
                  <span className="skills-count">{formData.skills?.length || 0} registradas</span>
                </div>

                <div className="skills-tags-container">
                  {formData.skills?.map((skill) => (
                    <span key={skill} className="skill-chip">
                      <span className="chip-bullet">•</span>
                      <span>{skill}</span>
                      {isEditing && (
                        <button
                          type="button"
                          className="chip-remove-btn"
                          onClick={() => handleRemoveSkill(skill)}
                          aria-label={`Eliminar habilidad ${skill}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {isEditing && (
                  <div className="add-skill-box">
                    <div className="add-skill-form">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                        placeholder="Ej. Docker, Next.js, AWS..."
                        className="profile-input skill-input"
                      />
                      <button
                        type="button"
                        className="btn-add-skill"
                        onClick={() => handleAddSkill()}
                      >
                        + Añadir
                      </button>
                    </div>

                    <div className="quick-suggestions-row">
                      <span className="suggestions-label">Sugerencias rápidas:</span>
                      <div className="suggestions-chips">
                        {SKILL_SUGGESTIONS.filter(
                          (s) => !formData.skills?.some((existing) => existing.toLowerCase() === s.toLowerCase())
                        )
                          .slice(0, 8)
                          .map((s) => (
                            <button
                              key={s}
                              type="button"
                              className="suggestion-btn"
                              onClick={() => handleAddSkill(s)}
                            >
                              +{s}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column */}
            <aside className="overview-sidebar-col">
              {/* Contact Information */}
              <div className="profile-section-card">
                <div className="section-card-header">
                  <h3>Información de Contacto</h3>
                </div>

                {!isEditing ? (
                  <ul className="contact-details-list">
                    <li className="contact-row">
                      <span className="contact-icon">📍</span>
                      <div>
                        <strong>Ubicación</strong>
                        <p>{formData.location || 'No especificada'}</p>
                      </div>
                    </li>
                    <li className="contact-row">
                      <span className="contact-icon">✉️</span>
                      <div>
                        <strong>Correo</strong>
                        <p>{formData.email}</p>
                      </div>
                    </li>
                    <li className="contact-row">
                      <span className="contact-icon">📱</span>
                      <div>
                        <strong>Teléfono / WhatsApp</strong>
                        <p>{formData.phone || 'No registrado'}</p>
                      </div>
                    </li>
                    <li className="contact-row">
                      <span className="contact-icon">🌐</span>
                      <div>
                        <strong>Sitio Web</strong>
                        <p>{formData.website || 'No registrado'}</p>
                      </div>
                    </li>
                  </ul>
                ) : (
                  <div className="contact-edit-form">
                    <div className="input-group">
                      <label htmlFor="edit-location">Ubicación</label>
                      <input
                        id="edit-location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        placeholder="Ej. Lima, Perú"
                        className="profile-input"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="edit-phone">Teléfono / WhatsApp</label>
                      <input
                        id="edit-phone"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        placeholder="+51 987 654 321"
                        className="profile-input"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="edit-website">Sitio Web / Portafolio</label>
                      <input
                        id="edit-website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleFieldChange('website', e.target.value)}
                        placeholder="https://tudominio.com"
                        className="profile-input"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="edit-github">GitHub URL</label>
                      <input
                        id="edit-github"
                        type="text"
                        value={formData.github}
                        onChange={(e) => handleFieldChange('github', e.target.value)}
                        placeholder="https://github.com/usuario"
                        className="profile-input"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="edit-linkedin">LinkedIn URL</label>
                      <input
                        id="edit-linkedin"
                        type="text"
                        value={formData.linkedin}
                        onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/usuario"
                        className="profile-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Kodvex Guarantee Card */}
              <div className="kodvex-badge-card">
                <div className="badge-shield-icon">🛡️</div>
                <h4>Garantía Kodvex</h4>
                <p>
                  Perfil verificado en la red de talentos Kodvex. Pagos protegidos, entregas con control de versiones y soporte continuo.
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* Tab 2: Portfolio & Projects */}
        {activeTab === 'portfolio' && (
          <div className="tab-content portfolio-tab-wrap">
            <div className="portfolio-header-bar">
              <div>
                <h2>Mis Proyectos & Publicaciones</h2>
                <p>Proyectos creados y software disponible en Kodvex.</p>
              </div>
              <button
                type="button"
                className="btn-add-project-primary"
                onClick={() => setShowAddProjectModal(true)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Nuevo proyecto</span>
              </button>
            </div>

            <div className="projects-catalog-grid">
              {formData.projects?.map((proj) => (
                <article key={proj.id} className="project-display-card">
                  <div className="project-card-media">
                    <img src={proj.image} alt={proj.name} loading="lazy" />
                    <span className="project-category-badge">{proj.category}</span>
                    {proj.price && <span className="project-price-badge">{proj.price}</span>}
                  </div>

                  <div className="project-card-body">
                    <h3 className="project-title">{proj.name}</h3>
                    <p className="project-desc">{proj.description}</p>

                    <div className="project-tags-list">
                      {proj.tags?.map((tag) => (
                        <span key={tag} className="project-tag-pill">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="project-card-footer">
                      {proj.link && proj.link !== '#' ? (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="project-link-btn"
                        >
                          <span>Ver demo</span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span className="project-live-indicator">● En catálogo Kodvex</span>
                      )}

                      <button
                        type="button"
                        className="project-delete-btn"
                        onClick={() => handleDeleteProject(proj.id)}
                        title="Eliminar proyecto del portafolio"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Services & Pricing */}
        {activeTab === 'services' && (
          <div className="tab-content services-tab-wrap">
            <div className="services-intro">
              <h2>Servicios Profesionales</h2>
              <p>Soluciones listas para contratar con cotización directa.</p>
            </div>

            <div className="services-cards-grid">
              {formData.services?.map((svc) => (
                <div key={svc.id} className="service-package-card">
                  <div className="service-card-header">
                    <h3>{svc.title}</h3>
                    <div className="service-price-tag">{svc.price}</div>
                    <span className="service-delivery-time">⏱️ Entrega: {svc.delivery}</span>
                  </div>

                  <p className="service-card-desc">{svc.description}</p>

                  <ul className="service-features-list">
                    {svc.features?.map((feat) => (
                      <li key={feat}>
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#22c55e" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`https://wa.me/${formData.phone?.replace(/[^0-9]/g, '') || '51999999999'}?text=${encodeURIComponent(`Hola ${formData.name}, me interesa cotizar el servicio: ${svc.title}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="service-hire-btn"
                  >
                    Cotizar este servicio
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Settings & Security */}
        {activeTab === 'settings' && (
          <div className="tab-content settings-tab-wrap">
            <div className="profile-section-card settings-card">
              <h3>Detalles de la Cuenta</h3>

              <div className="settings-field-row">
                <div>
                  <strong>Identificador de Usuario</strong>
                  <p className="text-muted">ID único de cuenta Kodvex</p>
                </div>
                <code className="settings-code">{formData.id || 'usr_kodvex_7f8a9b'}</code>
              </div>

              <div className="settings-field-row">
                <div>
                  <strong>Correo Registrado</strong>
                  <p className="text-muted">{formData.email}</p>
                </div>
                <span className="badge-status-green">Verificado</span>
              </div>

              <div className="settings-field-row">
                <div>
                  <strong>Método de Inicio de Sesión</strong>
                  <p className="text-muted">
                    {formData.provider === 'google' ? 'Google OAuth 2.0' : 'Email con código de verificación'}
                  </p>
                </div>
                <span className="badge-provider">{formData.provider || 'manual'}</span>
              </div>
            </div>

            <div className="profile-section-card settings-card danger-zone">
              <h3>Zona de Seguridad</h3>
              <p>Puedes cerrar la sesión activa en este dispositivo o restaurar los datos iniciales.</p>

              <div className="danger-actions-row">
                <button
                  type="button"
                  className="btn-danger-logout"
                  onClick={onLogout}
                >
                  Cerrar sesión en Kodvex
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Banner Picker Modal */}
      {showBannerPicker && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="picker-modal-card">
            <div className="picker-modal-header">
              <h3>Elige tu Portada</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowBannerPicker(false)}
              >
                ×
              </button>
            </div>

            <div className="banner-presets-grid">
              {PRESET_BANNERS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`preset-banner-item ${formData.banner === b.url ? 'is-selected' : ''}`}
                  onClick={() => {
                    handleFieldChange('banner', b.url)
                    setShowBannerPicker(false)
                    showToast('Portada actualizada.')
                  }}
                >
                  <img src={b.url} alt={b.name} />
                  <span>{b.name}</span>
                </button>
              ))}
            </div>

            <div className="custom-url-box">
              <label htmlFor="custom-banner-url">O pega una URL de imagen:</label>
              <div className="custom-url-row">
                <input
                  id="custom-banner-url"
                  type="url"
                  placeholder="https://ejemplo.com/portada.jpg"
                  className="profile-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (e.currentTarget.value) {
                        handleFieldChange('banner', e.currentTarget.value)
                        setShowBannerPicker(false)
                        showToast('Portada actualizada.')
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="picker-modal-card">
            <div className="picker-modal-header">
              <h3>Elige tu Foto de Perfil</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAvatarPicker(false)}
              >
                ×
              </button>
            </div>

            <div className="avatar-presets-grid">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`preset-avatar-item ${formData.avatar === av.url ? 'is-selected' : ''}`}
                  onClick={() => {
                    handleFieldChange('avatar', av.url)
                    setShowAvatarPicker(false)
                    showToast('Foto de perfil actualizada.')
                  }}
                >
                  <img src={av.url} alt={av.name} />
                </button>
              ))}
            </div>

            <div className="custom-url-box">
              <label htmlFor="custom-avatar-url">O usa tu avatar automático o pega una URL:</label>
              <div className="custom-url-row">
                <button
                  type="button"
                  className="btn-preset-mini"
                  onClick={() => {
                    const uiAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Usuario')}&background=0f766e&color=ffffff&size=180`
                    handleFieldChange('avatar', uiAvatar)
                    setShowAvatarPicker(false)
                    showToast('Avatar generado con tus iniciales.')
                  }}
                >
                  Generar con iniciales
                </button>
                <input
                  id="custom-avatar-url"
                  type="url"
                  placeholder="https://ejemplo.com/mifoto.jpg"
                  className="profile-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (e.currentTarget.value) {
                        handleFieldChange('avatar', e.currentTarget.value)
                        setShowAvatarPicker(false)
                        showToast('Foto de perfil actualizada.')
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="picker-modal-card project-modal-wide">
            <div className="picker-modal-header">
              <h3>Añadir Proyecto a tu Portafolio</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddProjectModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="add-project-form">
              <div className="input-group">
                <label htmlFor="proj-name">Nombre del Proyecto *</label>
                <input
                  id="proj-name"
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Ej. Sistema de Facturación Express"
                  className="profile-input"
                />
              </div>

              <div className="input-row-2col">
                <div className="input-group">
                  <label htmlFor="proj-category">Categoría</label>
                  <select
                    id="proj-category"
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="profile-select"
                  >
                    <option value="Páginas web">Páginas web</option>
                    <option value="Sistemas">Sistemas</option>
                    <option value="Apps de escritorio">Apps de escritorio</option>
                    <option value="A medida">A medida</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="proj-price">Precio referencial</label>
                  <input
                    id="proj-price"
                    type="text"
                    value={newProject.price}
                    onChange={(e) => setNewProject({ ...newProject, price: e.target.value })}
                    placeholder="Ej. S/ 1,800 o A cotizar"
                    className="profile-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="proj-desc">Descripción del proyecto</label>
                <textarea
                  id="proj-desc"
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="¿Qué problema resuelve este software y qué tecnologías usa?"
                  className="profile-textarea"
                />
              </div>

              <div className="input-row-2col">
                <div className="input-group">
                  <label htmlFor="proj-tags">Etiquetas / Stack (separadas por coma)</label>
                  <input
                    id="proj-tags"
                    type="text"
                    value={newProject.tags}
                    onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                    placeholder="React, Vite, Node, Tailwind"
                    className="profile-input"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="proj-link">Enlace de demo o repositorio</label>
                  <input
                    id="proj-link"
                    type="url"
                    value={newProject.link}
                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                    placeholder="https://tudemo.com"
                    className="profile-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="proj-img">URL de Imagen de portada</label>
                <input
                  id="proj-img"
                  type="url"
                  value={newProject.image}
                  onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="profile-input"
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel-mini"
                  onClick={() => setShowAddProjectModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save-mini">
                  Publicar en Portafolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
