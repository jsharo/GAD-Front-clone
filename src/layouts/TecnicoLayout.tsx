import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Wrench, LogOut, ChevronDown, Menu, X, Hammer } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'

const navItems = [
  { to: '/tecnico', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/tecnico/bandeja', icon: FileText, label: 'Mis Inspecciones', end: true },
]

const ACCENT = '#22C55E'

export function TecnicoLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = `${user?.nombre?.[0] ?? ''}${user?.apellido?.[0] ?? ''}` || 'T'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 px-4 md:px-8 h-16 flex items-center justify-between"
        style={{ background: 'rgba(5,20,12,0.92)', backdropFilter: 'blur(24px)', borderBottom: `1px solid ${ACCENT}20`, boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-3">
          <img src="/logo-gad.png" alt="GAD" className="w-9 h-9 object-contain rounded-xl" style={{ background: 'white', padding: '2px' }} />
          <div>
            <p className="font-heading font-bold text-white text-sm">GAD CAÑAR</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em' }}>PORTAL TÉCNICO</p>
            </div>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}20` }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive ? 'text-white' : 'text-white/60 hover:text-white/90'}`}
              style={({ isActive }) => isActive ? { background: `linear-gradient(135deg, ${ACCENT} 0%, #16A34A 100%)`, boxShadow: `0 0 20px ${ACCENT}50` } : {}}>
              <item.icon size={15} />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ background: `${ACCENT}08`, borderColor: `${ACCENT}25` }}>
            <Wrench size={12} style={{ color: ACCENT }} />
            <span style={{ color: `${ACCENT}cc`, fontSize: '0.7rem', fontWeight: 600 }}>{user?.zona || 'Técnico'}</span>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full transition-all border"
              style={{ background: dropdownOpen ? `${ACCENT}12` : `${ACCENT}04`, borderColor: dropdownOpen ? `${ACCENT}40` : `${ACCENT}15` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #16A34A 100%)`, color: 'white' }}>{initials}</div>
              <span className="text-white text-sm font-medium hidden sm:block">{user?.nombre?.split(' ')[0] || 'Técnico'}</span>
              <ChevronDown size={13} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-2xl overflow-hidden animate-slide-up"
                style={{ background: 'rgba(5,20,12,0.98)', backdropFilter: 'blur(20px)', border: `1px solid ${ACCENT}25`, boxShadow: `0 10px 40px rgba(0,0,0,0.5)` }}>
                <div className="p-4" style={{ borderBottom: `1px solid ${ACCENT}15` }}>
                  <p className="text-white font-bold text-sm">{user?.nombre} {user?.apellido}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: `${ACCENT}cc` }}>{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-3 px-2 py-1.5 rounded-lg w-max" style={{ background: `${ACCENT}15` }}>
                    <Hammer size={11} style={{ color: ACCENT }} />
                    <span style={{ color: ACCENT, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>Inspector Técnico</span>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left" style={{ color: '#F87171' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <LogOut size={15} /><span className="font-semibold text-sm">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="lg:hidden p-2 rounded-xl" style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.08)' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16 px-4 pb-6 flex flex-col" style={{ background: 'rgba(5,20,12,0.98)', backdropFilter: 'blur(20px)' }}>
          <nav className="flex-1 space-y-2 mt-6">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold transition-all ${isActive ? 'text-white' : 'text-white/60'}`}
                style={({ isActive }) => isActive ? { background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` } : {}}>
                <item.icon size={20} />{item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in relative z-10"><Outlet /></main>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full opacity-[0.02] blur-[120px]" style={{ background: ACCENT }} />
      </div>
    </div>
  )
}
