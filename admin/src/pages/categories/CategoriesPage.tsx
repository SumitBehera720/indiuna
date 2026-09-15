import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2, FolderTree, Upload } from 'lucide-react';
import api from '@/lib/api';
import { cn, getStatusColor } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import toast from 'react-hot-toast';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  parent?: { id: string; name: string } | null;
  products_count: number;
  is_active: boolean;
  sort_order: number;
  image?: string;
  redirect_to?: string;
  show_in_pages?: string;
  gender?: string;
  created_at: string;
}

const defaultForm = { name: '', slug: '', parent_id: '', is_active: true, sort_order: 0, image: '', redirect_to: '', show_in_pages: '', gender: 'all' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/categories', { params: { page, search } });
      setCategories(data.data ?? []);
      if (data.meta) {
        setLastPage(data.meta.last_page ?? 1);
        setTotal(data.meta.total ?? 0);
      }
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item: CategoryItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      parent_id: item.parent_id ?? '',
      is_active: item.is_active,
      sort_order: item.sort_order,
      image: item.image ?? '',
      redirect_to: item.redirect_to ?? '',
      show_in_pages: item.show_in_pages ?? '',
      gender: item.gender ?? 'all',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      const payload = { ...form, parent_id: form.parent_id || null };
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CategoryItem) => {
    if (!window.confirm(`Delete category "${item.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${item.id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const toggleStatus = async (item: CategoryItem) => {
    try {
      await api.put(`/admin/categories/${item.id}`, { is_active: !item.is_active });
      toast.success(`Category ${item.is_active ? 'deactivated' : 'activated'}`);
      fetchCategories();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (item: CategoryItem) => (
        <div className="flex flex-col">
          <span className="font-semibold text-surface-900 dark:text-white">
            {item.name}
          </span>
          {item.parent && (
            <span className="text-[10px] text-surface-400 font-normal">
              Sub of: {item.parent.name}
            </span>
          )}
        </div>
      ),
    },

    { key: 'products_count', header: 'Products', sortable: true },
    {
      key: 'is_active',
      header: 'Status',
      render: (item: CategoryItem) => (
        <span className={cn('badge', getStatusColor(item.is_active ? 'active' : 'inactive'))}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },

    {
      key: 'actions',
      header: 'Actions',
      render: (item: CategoryItem) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-primary-500">
            <Pencil size={14} />
          </button>
          <button onClick={() => toggleStatus(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-amber-500">
            {item.is_active ? <X size={14} /> : <Check size={14} />}
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
          <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Categories</h1>
          <p className="text-sm text-surface-400 mt-1">Manage categories and choose which pages they appear on.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="card p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchCategories} className="btn-secondary">Retry</button>
        </div>
      )}

      {!error && (
        <DataTable<CategoryItem>
          columns={columns}
          data={categories}
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
                  <FolderTree size={20} />
                </div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {editing ? 'Edit Category' : 'New Category'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Category name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="category-slug" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Parent Category</label>
                <select 
                  value={form.parent_id} 
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })} 
                  className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2.5 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter(c => (!editing || c.id !== editing.id) && !c.parent_id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cover Image</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <input 
                      value={form.image} 
                      onChange={(e) => setForm({ ...form, image: e.target.value })} 
                      className="input-field text-xs py-1.5" 
                      placeholder="Paste image URL (https://...)" 
                    />
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center justify-center px-2.5 py-1 border border-surface-200 dark:border-surface-800 rounded-lg text-[10px] font-semibold text-surface-700 dark:text-surface-300 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors">
                        <Upload size={10} className="mr-1" /> Choose File
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            const toastId = toast.loading('Uploading cover image...');
                            try {
                              const { data } = await api.post('/admin/media/upload', formData);
                              const url = data.url || data.data?.url;
                              if (url) {
                                setForm(prev => ({ ...prev, image: url }));
                                toast.success('Cover image uploaded', { id: toastId });
                              } else {
                                toast.error('Failed to parse uploaded image URL', { id: toastId });
                              }
                            } catch (err: any) {
                              toast.error(err?.response?.data?.message || 'Upload failed', { id: toastId });
                            }
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                  {form.image && (
                    <img 
                      src={form.image} 
                      alt="Cover Preview" 
                      className="w-16 h-12 object-cover rounded-lg border border-surface-200 dark:border-surface-800" 
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Show in Pages</label>
                <div className="grid grid-cols-2 gap-2 p-3 border border-surface-200 dark:border-surface-800 rounded-xl bg-surface-50 dark:bg-surface-900/40">
                  {[
                    { id: 'home', label: 'Home Page' },
                    { id: 'customization', label: 'Customization Page' },
                    { id: 'embroidered', label: 'Embroidered Page' },
                    { id: 'patches', label: 'Patches Page' }
                  ].map(pageOpt => {
                    const selectedList = form.show_in_pages ? form.show_in_pages.split(',') : [];
                    const isChecked = selectedList.includes(pageOpt.id);
                    return (
                      <label key={pageOpt.id} className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let newList;
                            if (e.target.checked) {
                              newList = [...selectedList, pageOpt.id];
                            } else {
                              newList = selectedList.filter(x => x !== pageOpt.id);
                            }
                            setForm({ ...form, show_in_pages: newList.join(',') });
                          }}
                          className="rounded border-surface-300 dark:border-surface-700 text-primary-600 focus:ring-primary-500"
                        />
                        {pageOpt.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Status</label>
                  <select value={form.is_active ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })} className="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
