import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Activity,
  LogOut,
  Menu,
  MoonStar,
  SunMedium,
  ShieldCheck,
} from 'lucide-react';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import { toggleSidebar, toggleTheme } from '../../app/uiSlice';
import type { RootState } from '../../app/store';

export function Layout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const currentUser = useSelector(selectCurrentUser);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Audit Log', href: '/audit', icon: Activity },
  ];

  const pageTitle = location.pathname.split('/')[1]?.replace('-', ' ') || 'Dashboard';
  const formattedPageTitle = pageTitle.replace(/\b\w/g, character => character.toUpperCase());

  return (
    <div className="flex min-h-screen bg-transparent text-slate-900 transition-colors duration-300">
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-24'}
          hidden md:flex flex-col border-r border-slate-200/60 bg-slate-950 text-white shadow-2xl shadow-slate-900/20 transition-all duration-300 ease-out`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-4">
          <div className={`flex items-center gap-3 overflow-hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
              A
            </div>
            <div className="truncate">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">ACME</p>
              <p className="text-lg font-semibold text-white">HR Suite</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-200 transition hover:bg-slate-800"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <div className="truncate">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Secure access</p>
              <p className="text-sm font-medium text-slate-200">Operations control</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-2 pb-4 pt-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={`ml-3 truncate ${sidebarOpen ? 'block' : 'hidden'}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-2">
          <button
            onClick={() => dispatch(logout())}
            className="flex w-full items-center rounded-2xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={`ml-3 truncate ${sidebarOpen ? 'block' : 'hidden'}`}>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 md:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Human resources</p>
                <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{formattedPageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => dispatch(toggleTheme())}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-sm font-semibold text-white">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'H'}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Signed in</p>
                  <p className="text-sm font-medium text-slate-800">{currentUser?.name || 'HR Manager'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
