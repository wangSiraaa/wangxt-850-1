import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Calendar, PlusCircle, FileCheck, Wrench, RotateCcw, Building2 } from 'lucide-react';
import RoleSelector from './RoleSelector';
import ConflictAlert from './ConflictAlert';

const navItems = [
  { path: '/', label: '场地日历', icon: Calendar, roles: ['club_leader', 'admin', 'logistics'] },
  { path: '/reserve', label: '预约场地', icon: PlusCircle, roles: ['club_leader'] },
  { path: '/audit', label: '审核队列', icon: FileCheck, roles: ['admin'] },
  { path: '/setup', label: '布置清单', icon: Wrench, roles: ['logistics'] },
  { path: '/revoke', label: '撤销记录', icon: RotateCcw, roles: ['club_leader', 'admin', 'logistics'] },
];

export default function Layout() {
  const { currentRole } = useAppStore();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">校园场地预约系统</h1>
                <p className="text-xs text-gray-500">Venue Reservation System</p>
              </div>
            </div>
            <RoleSelector />
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <ConflictAlert />
    </div>
  );
}
