import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FolderTree, Tag,
  Star, FileText, Settings, ChevronLeft, ChevronRight, Percent, Image
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/categories', icon: FolderTree, label: 'Categories' },
  { to: '/banners', icon: Image, label: 'Banners' },
  { to: '/coupons', icon: Percent, label: 'Coupons' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/blog', icon: FileText, label: 'Blog' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700/50 z-30 transition-all duration-300 flex flex-col',
      open ? 'w-[280px]' : 'w-0 overflow-hidden'
    )}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-surface-100 dark:border-surface-800">
        <div>
          <h1 className="text-xl font-bold font-heading tracking-tight text-primary-500">INDIUNA</h1>
          <p className="text-[10px] text-surface-400 uppercase tracking-widest font-medium">Admin Panel</p>
        </div>
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100'
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-surface-100 dark:border-surface-800">
        <p className="text-xs text-surface-400">INDIUNA v1.0</p>
      </div>
    </aside>
  );
}
