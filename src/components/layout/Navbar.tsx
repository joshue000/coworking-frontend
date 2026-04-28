import { NavLink } from 'react-router-dom';
import { Building2, Calendar, LayoutGrid, Activity, LogOut, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const links = [
  { to: '/manage/places', label: 'Places', icon: MapPin },
  { to: '/spaces', label: 'Spaces', icon: LayoutGrid },
  { to: '/reservations', label: 'Reservations', icon: Calendar },
  { to: '/admin', label: 'IoT Dashboard', icon: Activity },
];

export function Navbar() {
  const clearApiKey = useAuthStore((s) => s.clearApiKey);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-slate-900">Coworking</span>
        </div>

        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>

        <button
          onClick={clearApiKey}
          title="Change API key"
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">API Key</span>
        </button>
      </div>
    </nav>
  );
}
