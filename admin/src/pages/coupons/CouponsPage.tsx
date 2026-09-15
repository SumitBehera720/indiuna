import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Percent } from 'lucide-react';
import api from '@/lib/api';
import { cn, getStatusColor, formatCurrency, formatDate } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import toast from 'react-hot-toast';

interface CouponItem {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const defaultForm = {
  code: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  value: 0,
  min_order_amount: 0,
  max_discount: 0,
  usage_limit: 0,
  expires_at: '',
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CouponItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/coupons', { params: { page, search } });
      setCoupons(data.data ?? []);
      if (data.meta) {
        setLastPage(data.meta.last_page ?? 1);
        setTotal(data.meta.total ?? 0);
      }
    } catch {
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item: CouponItem) => {
    setEditing(item);
    setForm({
      code: item.code,
      discount_type: item.discount_type,
      value: item.value,
      min_order_amount: item.min_order_amount ?? 0,
      max_discount: item.max_discount ?? 0,
      usage_limit: item.usage_limit ?? 0,
      expires_at: item.expires_at ? item.expires_at.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (form.value <= 0) return toast.error('Value must be greater than 0');
    setSaving(true);
    try {
      const payload = {
        ...form,
        min_order_amount: form.min_order_amount || null,
        max_discount: form.max_discount || null,
        usage_limit: form.usage_limit || null,
      };
      if (editing) {
        await api.put(`/admin/coupons/${editing.id}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CouponItem) => {
    if (!window.confirm(`Delete coupon "${item.code}"?`)) return;
    try {
      await api.delete(`/admin/coupons/${item.id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleActive = async (item: CouponItem) => {
    try {
      await api.put(`/admin/coupons/${item.id}`, { is_active: !item.is_active });
      toast.success(`Coupon ${item.is_active ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    {
      key: 'discount_type',
      header: 'Type',
      render: (item: CouponItem) => (
        <span className={cn('badge', item.discount_type === 'percentage' ? 'badge-info' : 'badge-warning')}>
          {item.discount_type === 'percentage' ? '%' : '₹'}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      sortable: true,
      render: (item: CouponItem) => (
        <span className="font-medium">
          {item.discount_type === 'percentage' ? `${item.value}%` : formatCurrency(item.value)}
        </span>
      ),
    },
    {
      key: 'min_order_amount',
      header: 'Min Order',
      render: (item: CouponItem) => (
        <span className="text-surface-500">{item.min_order_amount ? formatCurrency(item.min_order_amount) : '—'}</span>
      ),
    },
    {
      key: 'used_count',
      header: 'Usage',
      sortable: true,
      render: (item: CouponItem) => (
        <span className="text-surface-500">{item.used_count}{item.usage_limit ? ` / ${item.usage_limit}` : ''}</span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item: CouponItem) => {
        if (isExpired(item.expires_at)) return <span className="badge badge-danger">Expired</span>;
        return (
          <span className={cn('badge', getStatusColor(item.is_active ? 'active' : 'inactive'))}>
            {item.is_active ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'expires_at',
      header: 'Expiry',
      sortable: true,
      render: (item: CouponItem) => (
        <span className={cn('text-sm', isExpired(item.expires_at) && 'text-red-500')}>
          {formatDate(item.expires_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: CouponItem) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-primary-500">
            <Pencil size={14} />
          </button>
          <button onClick={() => toggleActive(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-amber-500">
            {item.is_active ? <X size={14} /> : <Percent size={14} />}
          </button>
          <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Coupons</h1>
          <p className="text-sm text-surface-400 mt-1">Manage discount coupons</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Coupon
        </button>
      </div>

      {error && (
        <div className="card p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchCoupons} className="btn-secondary">Retry</button>
        </div>
      )}

      {!error && (
        <DataTable<CouponItem>
          columns={columns}
          data={coupons}
          loading={loading}
          searchable
          onSearch={setSearch}
          pagination={{ page, lastPage, total, onPageChange: setPage }}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass-card w-full max-w-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                  <Percent size={20} />
                </div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {editing ? 'Edit Coupon' : 'New Coupon'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Code</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" placeholder="SUMMER20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })} className="input-field">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Value</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="input-field" placeholder={form.discount_type === 'percentage' ? '10' : '500'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Min Order Amount</label>
                  <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} className="input-field" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Max Discount</label>
                  <input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: Number(e.target.value) })} className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Usage Limit</label>
                  <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} className="input-field" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Expires At</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
