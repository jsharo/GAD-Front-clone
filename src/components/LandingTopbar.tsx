import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, Menu, X, LogIn } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'INICIO', to: '/' },
  { label: 'SERVICIOS', to: '#servicios' },
  { label: 'TRÁMITES', to: '#tramites' },
  {
    label: 'MUNICIPIO',
    children: ['Historia', 'Autoridades', 'Organigrama', 'Misión y Visión'],
  },
  { label: 'NOTICIAS', to: '#noticias' },
  {
    label: 'GESTIÓN',
    children: ['Plan de Desarrollo', 'Presupuesto', 'POA', 'Informes'],
  },
  {
    label: 'TRANSPARENCIA',
    children: ['Información Pública', 'Contratación', 'LOTAIP'],
  },
]

export function LandingTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>

      {/* ── FILA 1: Branding + Login ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo + Nombre */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-gad.png"
              alt="GAD Cañar"
              className="w-11 h-11 object-contain"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(37,99,235,0.15))' }}
            />
            <div>
              <p className="font-heading font-extrabold text-xl leading-none tracking-wider"
                style={{ color: '#2563EB', letterSpacing: '0.05em' }}>
                CAÑAR
              </p>
              <p className="text-xs font-semibold tracking-widest mt-0.5"
                style={{ color: '#F5C100', fontSize: '0.55rem', letterSpacing: '0.18em' }}>
                CANTÓN INTERCULTURAL
              </p>
            </div>
            {/* Banda de colores del escudo */}
            <div className="hidden sm:flex flex-col gap-0.5 ml-2">
              {['#CC2229','#F5C100','#22C55E','#2563EB'].map(c => (
                <div key={c} style={{ width: 18, height: 3, background: c, borderRadius: 2 }} />
              ))}
            </div>
          </Link>

          {/* Search expandible */}
          <div className="hidden md:flex items-center gap-2">
            {searchOpen && (
              <input
                autoFocus
                placeholder="Buscar trámite..."
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none w-48 focus:border-blue-400 transition-all"
                onBlur={() => setSearchOpen(false)}
              />
            )}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              style={{ color: '#64748b' }}>
              <Search size={18} />
            </button>
          </div>

          {/* Iniciar sesión */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              <LogIn size={15} />
              Iniciar Sesión Normal
            </Link>
            <Link to="/registro"
              className="text-xs font-bold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
              Registrarme
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── FILA 2: Navegación principal ── */}
      <div className="hidden md:block" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center">
            {NAV_ITEMS.map(item => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <button
                    className="flex items-center gap-1 px-4 py-3.5 text-xs font-bold tracking-wider transition-all border-b-2 border-transparent group-hover:border-blue-500"
                    style={{ color: '#374151' }}
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}>
                    {item.label}
                    <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />
                  </button>
                ) : (
                  <Link
                    to={item.to!}
                    className="flex items-center px-4 py-3.5 text-xs font-bold tracking-wider transition-all border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600"
                    style={{ color: item.to === '/' ? '#2563EB' : '#374151',
                      borderBottomColor: item.to === '/' ? '#F5C100' : 'transparent' }}>
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 py-2 rounded-b-xl shadow-xl min-w-44 z-50 animate-slide-up"
                    style={{ background: 'white', border: '1px solid #e2e8f0', borderTop: 'none' }}
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}>
                    {item.children.map(child => (
                      <a key={child} href="#"
                        className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
                        {child}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>


      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map(item => (
              <div key={item.label}>
                <a href={item.to ?? '#'}
                  className="block px-3 py-2.5 text-sm font-bold tracking-wider text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => !item.children && setMobileOpen(false)}>
                  {item.label}
                </a>
                {item.children?.map(child => (
                  <a key={child} href="#"
                    className="block pl-8 py-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    {child}
                  </a>
                ))}
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <LogIn size={15} />
                Iniciar Sesión Normal
              </Link>
              <Link to="/registro" onClick={() => setMobileOpen(false)}
                className="text-center text-sm font-bold px-4 py-2.5 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)' }}>
                Registrarme
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
