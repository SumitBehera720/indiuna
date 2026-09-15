import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { DashboardStats } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard/stats'),
      api.get('/admin/dashboard/revenue-chart'),
      api.get('/admin/dashboard/sales-chart'),
    ])
      .then(([statsRes, revenueRes, salesRes]) => {
        setStats({
          ...statsRes.data.data,
          revenue_chart: revenueRes.data.data || [],
          sales_chart: salesRes.data.data || [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-200 dark:bg-surface-700 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-surface-200 dark:bg-surface-700 rounded-2xl" />
          <div className="h-80 bg-surface-200 dark:bg-surface-700 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-surface-200 dark:bg-surface-700 rounded-2xl" />
          <div className="h-72 bg-surface-200 dark:bg-surface-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Revenue Today',
      value: formatCurrency(stats?.revenue_today ?? 0),
      icon: DollarSign,
      trend: 12,
    },
    {
      title: 'Revenue This Month',
      value: formatCurrency(stats?.revenue_month ?? 0),
      icon: TrendingUp,
      trend: 8,
    },
    {
      title: 'Orders Today',
      value: stats?.orders_today ?? 0,
      icon: ShoppingCart,
      trend: -3,
    },
    {
      title: 'Pending Orders',
      value: stats?.orders_pending ?? 0,
      icon: Package,
      trend: 5,
    },
    {
      title: 'Total Customers',
      value: stats?.total_customers ?? 0,
      icon: Users,
      trend: 15,
    },
    {
      title: 'Low Stock Items',
      value: stats?.low_stock_count ?? 0,
      icon: AlertTriangle,
      trend: 2,
      trendLabel: 'vs last week',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Overview of your store performance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500 bg-white/60 dark:bg-surface-800/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div
            key={card.title}
            className="opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Revenue Overview</h3>
              <p className="text-xs text-surface-500 mt-0.5">Daily revenue trend</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.revenue_chart ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-200 dark:text-surface-700/50" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-surface-400" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} className="text-surface-400" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Sales Overview</h3>
              <p className="text-xs text-surface-500 mt-0.5">Daily sales count</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.sales_chart ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-200 dark:text-surface-700/50" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-surface-400" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} className="text-surface-400" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Top Products</h3>
              <p className="text-xs text-surface-500 mt-0.5">Best performing products by revenue</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800">
                  <th className="text-left py-3 px-2 text-surface-500 font-medium text-xs uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-2 text-surface-500 font-medium text-xs uppercase tracking-wider">Product</th>
                  <th className="text-right py-3 px-2 text-surface-500 font-medium text-xs uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.top_products ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-surface-400">No data available</td>
                  </tr>
                ) : (
                  stats?.top_products.map((product, i) => (
                    <tr key={product.id} className="border-b border-surface-50 dark:border-surface-800/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="py-3.5 px-2 text-surface-400">{String(i + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 px-2 font-medium text-surface-900 dark:text-surface-100">{product.name}</td>
                      <td className="py-3.5 px-2 text-right font-semibold text-surface-900 dark:text-surface-100">{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Inventory Alerts</h3>
              <p className="text-xs text-surface-500 mt-0.5">Items running low on stock</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-500">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="space-y-3">
            {(stats?.inventory_alerts ?? []).length === 0 ? (
              <div className="text-center py-12 text-surface-400">
                <Package size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">All stocked up!</p>
              </div>
            ) : (
              stats?.inventory_alerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{alert.product}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    {alert.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Latest Orders</h3>
            <p className="text-xs text-surface-500 mt-0.5">Most recent orders placed</p>
          </div>
          <button className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800">
                <th className="text-left py-3 px-2 text-surface-500 font-medium text-xs uppercase tracking-wider">Order</th>
                <th className="text-left py-3 px-2 text-surface-500 font-medium text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-2 text-surface-500 font-medium text-xs uppercase tracking-wider">Date</th>
                <th className="text-right py-3 px-2 text-surface-500 font-medium text-xs uppercase tracking-wider">Total</th>
                <th className="text-right py-3 px-2 text-surface-500 font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.latest_orders ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-surface-400">No orders yet</td>
                </tr>
              ) : (
                stats?.latest_orders.map((order) => (
                  <tr key={order.id} className="border-b border-surface-50 dark:border-surface-800/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="py-3.5 px-2 font-medium text-surface-900 dark:text-surface-100">#{order.order_number}</td>
                    <td className="py-3.5 px-2 text-surface-700 dark:text-surface-300">{order.customer?.name || 'Guest'}</td>
                    <td className="py-3.5 px-2 text-surface-500">{formatDate(order.created_at)}</td>
                    <td className="py-3.5 px-2 text-right font-semibold text-surface-900 dark:text-surface-100">{formatCurrency(order.total)}</td>
                    <td className="py-3.5 px-2 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
