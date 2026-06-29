import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore, type Role } from '@/stores/auth.store';
import { PORTAL_CONFIG_BY_ROLE, resolvePortalRole } from '@/router/portal.config';

export function UsersLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeRole = useMemo<Role>(
    () => resolvePortalRole(location.pathname, user?.role),
    [location.pathname, user?.role]
  );
  const layout = PORTAL_CONFIG_BY_ROLE[activeRole];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/signin');
  };

  const BadgeIcon = layout.badgeIcon;
  const activeNavClassName = 'text-neutral-50 bg-secondary-default';
  const inactiveNavClassName = 'text-neutral-50 hover:bg-primary-dark hover:text-neutral-50';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900">
      <header className="sticky top-0 z-50 px-4 md:px-8 h-20 flex items-center justify-between bg-primary-default border-b border-primary-dark text-neutral-50">
        <div className="flex items-center gap-3">
          <img
            src="/logo-gad.png"
            alt="GAD"
            className="w-10 h-10 object-contain rounded-lg bg-primary-default p-0.5"
          />
          <div>
            <p className="font-heading font-black text-neutral-50 text-sm tracking-wide">
              GAD CAÑAR
            </p>
            <div className="flex items-center mt-0.5">
              <p className="text-neutral-100 text-[0.65rem] font-bold tracking-[0.08em]">
                {layout.panelLabel}
              </p>
            </div>
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-2 p-1 rounded-full bg-transparent border border-transparent">
          {layout.navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold ${isActive ? activeNavClassName : inactiveNavClassName}`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-neutral-100 bg-neutral-50/10 hover:bg-primary-dark hover:text-neutral-50 active:bg-secondary-dark"
            >
              <User size={16} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden origin-top-right bg-neutral-50 border border-neutral-300 z-50 text-left">
                <div className="p-4 border-b border-neutral-200">
                  <p className="text-neutral-800 font-bold">
                    {user?.first_name ?? 'Usuario'} {user?.last_name ?? ''}
                  </p>
                  <p className="text-xs mt-0.5 truncate font-semibold text-primary-default">
                    {user?.email ?? 'Sin sesión activa'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 px-2 py-1.5 rounded-lg w-max bg-primary-light/10">
                    <BadgeIcon size={12} className="text-primary-default" />
                    <span className="text-[0.65rem] font-bold uppercase text-primary-default">
                      {layout.badgeLabel}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error-default hover:bg-primary-dark hover:text-neutral-50"
                  >
                    <LogOut size={16} />
                    <span className="font-semibold text-sm">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="xl:hidden p-2 rounded-xl text-neutral-50 bg-transparent hover:bg-primary-dark hover:text-neutral-50 active:bg-secondary-dark"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 pt-20 px-4 pb-6 flex flex-col bg-neutral-50/95">
          <nav className="flex-1 space-y-2 mt-4 text-left">
            {layout.navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold ${isActive ? 'text-neutral-50 bg-secondary-default' : 'text-neutral-700 hover:bg-primary-dark hover:text-neutral-50'}`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        <Outlet />
      </main>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[50%] rounded-full opacity-[0.03] blur-[120px] bg-primary-default" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.02] blur-[100px] bg-primary-default" />
      </div>
    </div>
  );
}
