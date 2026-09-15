import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import CustomersPage from './pages/customers/CustomersPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import CouponsPage from './pages/coupons/CouponsPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import BlogPage from './pages/cms/BlogPage';
import BannersPage from './pages/banners/BannersPage';
import SettingsPage from './pages/settings/SettingsPage';
import LoginPage from './pages/auth/LoginPage';
import { AuthProvider, useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 bg-surface-50 dark:bg-surface-950">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><DashboardLayout><ProductsPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><DashboardLayout><ProductDetailPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><DashboardLayout><OrdersPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><DashboardLayout><OrderDetailPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><DashboardLayout><CustomersPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><DashboardLayout><CategoriesPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/banners" element={<ProtectedRoute><DashboardLayout><BannersPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute><DashboardLayout><CouponsPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><DashboardLayout><ReviewsPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/blog" element={<ProtectedRoute><DashboardLayout><BlogPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
