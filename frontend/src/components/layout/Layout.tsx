import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Users, BarChart3, Activity, LogOut, Menu } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebar } from '../../app/uiSlice';
import type { RootState } from '../../app/store';

export function Layout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Audit Log', href: '/audit', icon: Activity },
  ];
  const pageTitle = location.pathname.split('/')[1]?.replace('-', ' ') || 'Dashboard';
  const formattedPageTitle = pageTitle.replace(/\b\w/g, character => character.toUpperCase());

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col bg-slate-900 text-white transition-all duration-300`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <span className={`font-bold text-xl truncate ${sidebarOpen ? 'block' : 'hidden'}`}>ACME HR</span>
          <button onClick={() => dispatch(toggleSidebar())} className="p-2 hover:bg-slate-800 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`ml-3 truncate ${sidebarOpen ? 'block' : 'hidden'}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-slate-800">
          <button
            onClick={() => dispatch(logout())}
            className="flex w-full items-center px-3 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 truncate ${sidebarOpen ? 'block' : 'hidden'}`}>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
          <h1 className="text-xl font-semibold text-slate-800">
            {formattedPageTitle}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
