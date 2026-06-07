import { useAppStore } from '@/store/useAppStore';
import { ROLE_INFO, UserRole } from '@/types';
import { Users, ShieldCheck, Wrench, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const roleIcons: Record<string, React.ReactNode> = {
  Users: <Users className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
};

export default function RoleSelector() {
  const { currentRole, setCurrentRole } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const currentRoleInfo = ROLE_INFO[currentRole];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all group"
      >
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 group-hover:bg-primary-200 transition-colors">
          {roleIcons[currentRoleInfo.icon]}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-800">{currentRoleInfo.name}</p>
          <p className="text-xs text-gray-500">切换身份</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
          <div className="p-2">
            {Object.values(ROLE_INFO).map((role, index) => (
              <button
                key={role.key}
                onClick={() => {
                  setCurrentRole(role.key as UserRole);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all stagger-${index + 1} ${
                  currentRole === role.key
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentRole === role.key ? 'bg-primary-200' : 'bg-gray-100'
                  }`}
                >
                  {roleIcons[role.icon]}
                </div>
                <div className="text-left">
                  <p className="font-medium">{role.name}</p>
                  <p className="text-xs text-gray-500">{role.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
