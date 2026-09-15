import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/ui/DataTable';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Customer, PaginatedResponse } from '@/types';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page, per_page: 15 };
      if (search) params.search = search;
      const res = await api.get<PaginatedResponse<Customer>>('/admin/customers', { params });
      setCustomers(res.data.data);
      setPage(res.data.meta.current_page);
      setLastPage(res.data.meta.last_page);
      setTotal(res.data.meta.total);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const debouncedSearch = useDebounce(search, 500);
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      fetchCustomers();
    }
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Customers</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <DataTable<Customer>
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          {
            key: 'phone',
            header: 'Phone',
            render: (c) => c.phone || '—',
          },
          {
            key: 'total_orders',
            header: 'Orders',
            render: (c) => c.total_orders,
          },
          {
            key: 'total_spent',
            header: 'Total Spent',
            render: (c) => formatCurrency(c.total_spent),
          },
          {
            key: 'status',
            header: 'Status',
            render: (c) => (
              <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
            ),
          },
          {
            key: 'created_at',
            header: 'Joined',
            render: (c) => formatDate(c.created_at),
          },
        ]}
        data={customers}
        loading={loading}
        searchable
        onSearch={setSearch}
        onRowClick={(c) => navigate(`/orders?customer_id=${c.id}`)}
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
