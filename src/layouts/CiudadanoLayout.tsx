import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, PlusCircle,
  LogOut, ChevronDown, Menu, X, CheckCircle2
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'

const navItems = [
  { to: '/ciudadano', icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/ciudadano/solicitudes', icon: FileText, label: 'Mis Solicitudes', end: true },
  { to: '/ciudadano/solicitudes/nueva', icon: PlusCircle, label: 'Nueva Solicitud', end: true },
]

export function CiudadanoLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = `${user?.nombre?.[0] ?? ''}${user?.apellido?.[0] ?? ''}` || 'U'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-blue-950">
      
      {/* ── TOPBAR ── */}
      <header className="sticky top-0 z-50 px-4 md:px-8 h-16 flex items-center justify-between"
        style={{
          background: 'rgba(11, 17, 32, 0.92)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(37,99,235,0.15)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
        }}>
        
        {/* LEFT: Branding */}
        <div className="flex items-center gap-3">
          <img src="/logo-gad.png" alt="GAD" className="w-9 h-9 object-contain rounded-xl"
            style={{ background: 'white', padding: '2px', boxShadow: '0 0 15px rgba(37,99,235,0.2)' }} />
          <div>
            <p className="font-heading font-bold text-white text-sm tracking-wide">GAD CAÑAR</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB', boxShadow: '0 0 8px #2563EB' }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                PORTAL CIUDADANO
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full"
          style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                ${isActive ? 'text-white' : 'text-white/60 hover:text-white/90'}`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 0 20px rgba(37,99,235,0.4)'
              } : {}}
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full transition-all border"
              style={{
                background: dropdownOpen ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.04)',
                borderColor: dropdownOpen ? 'rgba(37,99,235,0.4)' : 'rgba(37,99,235,0.12)',
              }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: 'white', boxShadow: '0 0 10px rgba(37,99,235,0.3)' }}>
                {initials}
              </div>
              <span className="text-white text-sm font-medium hidden sm:block">
                {user?.nombre?.split(' ')[0] || 'Usuario'}
              </span>
              <ChevronDown size={13} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-2xl overflow-hidden animate-slide-up"
                style={{
                  background: 'rgba(17,24,39,0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(37,99,235,0.15)'
                }}>
                <div className="p-4" style={{ borderBottom: '1px solid rgba(37,99,235,0.1)' }}>
                  <p className="text-white font-bold text-sm">{user?.nombre} {user?.apellido}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(59,130,246,0.9)' }}>{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-3 px-2 py-1.5 rounded-lg w-max"
                    style={{ background: user?.role === 'INVITADO' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)' }}>
                    <CheckCircle2 size={11} style={{ color: user?.role === 'INVITADO' ? '#D97706' : '#22C55E' }} />
                    <span style={{
                      color: user?.role === 'INVITADO' ? '#D97706' : '#22C55E',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {user?.role === 'INVITADO' ? 'Perfil pendiente' : 'Ciudadano verificado'}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                    style={{ color: '#F87171' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <LogOut size={15} />
                    <span className="font-semibold text-sm">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 rounded-xl" style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.08)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU OVERLAY ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16 px-4 pb-6 flex flex-col"
          style={{ background: 'rgba(11,17,32,0.98)', backdropFilter: 'blur(20px)' }}>
          <nav className="flex-1 space-y-2 mt-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold transition-all
                  ${isActive ? 'text-white' : 'text-white/60 hover:text-white/90'}`
                }
                style={({ isActive }) => isActive ? {
                  background: 'rgba(37,99,235,0.15)',
                  border: '1px solid rgba(37,99,235,0.3)',
                  boxShadow: '0 0 20px rgba(37,99,235,0.1)'
                } : {}}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in relative z-10">
        <Outlet />
      </main>

      {/* Background Decorators */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.025] blur-[120px]" style={{ background: '#2563EB' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-[0.015] blur-[100px]" style={{ background: '#2563EB' }} />
      </div>
    </div>
  )
}
