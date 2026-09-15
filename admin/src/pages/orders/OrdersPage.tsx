import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Order, PaginatedResponse } from '@/types';

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page, per_page: 15 };
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await api.get<PaginatedResponse<Order>>('/admin/orders', { params });
      setOrders(res.data.data);
      setPage(res.data.meta.current_page);
      setLastPage(res.data.meta.last_page);
      setTotal(res.data.meta.total);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const debouncedSearch = useDebounce(search, 500);
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setPage(1);
      fetchOrders();
    }
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Orders</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field w-44"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <DataTable<Order>
        columns={[
          { key: 'order_number', header: 'Order #' },
          {
            key: 'customer',
            header: 'Customer',
            render: (o) => o.customer?.name || 'Guest',
          },
          {
            key: 'items',
            header: 'Items',
            render: (o) => o.items?.length ?? 0,
          },
          {
            key: 'total',
            header: 'Total',
            render: (o) => formatCurrency(o.total),
          },
          {
            key: 'status',
            header: 'Status',
            render: (o) => (
              <span className={`badge ${getStatusColor(o.status)}`}>{o.status}</span>
            ),
          },
          {
            key: 'payment_status',
            header: 'Payment',
            render: (o) => (
              <span className={`badge ${getStatusColor(o.payment_status)}`}>{o.payment_status}</span>
            ),
          },
          {
            key: 'created_at',
            header: 'Date',
            render: (o) => formatDate(o.created_at),
          },
          {
            key: 'actions',
            header: '',
            width: '60px',
            render: (o) => (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/orders/${o.id}`); }}
                className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-primary-500 transition-colors"
              >
                <Eye size={16} />
              </button>
            ),
          },
        ]}
        data={orders}
        loading={loading}
        searchable
        onSearch={setSearch}
        onRowClick={(o) => navigate(`/orders/${o.id}`)}
        pagination={{
          page,
          lastPage,
          total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
