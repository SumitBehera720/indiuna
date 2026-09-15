import { Search, Bell, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    setDarkMode(html.classList.contains('dark'));
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-surface-200 dark:bg-surface-900/80 dark:border-surface-700/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden">
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-surface-200 dark:border-surface-700">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-semibold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{user?.name || 'Admin'}</p>
            <p className="text-xs text-surface-400">{user?.email}</p>
          </div>
          <button onClick={logout} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
