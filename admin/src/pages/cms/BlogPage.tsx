import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, FileText, Eye } from 'lucide-react';
import api from '@/lib/api';
import { cn, getStatusColor, formatDate } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  excerpt?: string;
  content?: string;
  image?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
}

const defaultForm = {
  title: '',
  slug: '',
  author: '',
  category: '',
  excerpt: '',
  content: '',
  status: 'draft' as 'draft' | 'published',
};

const tabs = ['all', 'published', 'draft'] as const;
type Tab = typeof tabs[number];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const statusParam = activeTab === 'all' ? undefined : activeTab;
      const { data } = await api.get('/admin/blogs', { params: { page, search, status: statusParam } });
      setPosts(data.data ?? []);
      if (data.meta) {
        setLastPage(data.meta.last_page ?? 1);
        setTotal(data.meta.total ?? 0);
      }
    } catch {
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTab]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item: BlogPost) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      author: item.author,
      category: item.category,
      excerpt: item.excerpt ?? '',
      content: item.content ?? '',
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.slug.trim()) return toast.error('Slug is required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/blogs/${editing.id}`, form);
        toast.success('Post updated');
      } else {
        await api.post('/admin/blogs', form);
        toast.success('Post created');
      }
      setShowModal(false);
      fetchPosts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: BlogPost) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.delete(`/admin/blogs/${item.id}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const toggleStatus = async (item: BlogPost) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/admin/blogs/${item.id}`, { status: newStatus });
      toast.success(`Post ${newStatus}`);
      fetchPosts();
    } catch {
      toast.error('Failed to update post');
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (item: BlogPost) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 overflow-hidden">
            {item.image ? (
              <img src={item.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <FileText size={14} />
            )}
          </div>
          <span className="font-medium text-surface-700 dark:text-surface-300 truncate max-w-[250px]">
            {item.title}
          </span>
        </div>
      ),
    },
    { key: 'author', header: 'Author' },
    { key: 'category', header: 'Category' },
    {
      key: 'status',
      header: 'Status',
      render: (item: BlogPost) => (
        <span className={cn('badge', getStatusColor(item.status))}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'published_at',
      header: 'Published',
      sortable: true,
      render: (item: BlogPost) => (
        <span className="text-surface-500 text-sm">
          {item.published_at ? formatDate(item.published_at) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: BlogPost) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-primary-500">
            <Pencil size={14} />
          </button>
          {item.status === 'draft' && (
            <button onClick={() => toggleStatus(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-emerald-500">
              <Eye size={14} />
            </button>
          )}
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
          <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Blog Posts</h1>
          <p className="text-sm text-surface-400 mt-1">Manage blog content</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          New Post
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-surface-200 dark:border-surface-700/50 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors relative',
              activeTab === tab
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
          </button>
        ))}
      </div>

      {error && (
        <div className="card p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchPosts} className="btn-secondary">Retry</button>
        </div>
      )}

      {!error && (
        <DataTable<BlogPost>
          columns={columns}
          data={posts}
          loading={loading}
          searchable
          onSearch={setSearch}
          pagination={{ page, lastPage, total, onPageChange: setPage }}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass-card w-full max-w-2xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                  <FileText size={20} />
                </div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {editing ? 'Edit Post' : 'New Post'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Post title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="post-slug" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Author</label>
                  <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-field" placeholder="Author name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="Category" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Excerpt</label>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field min-h-[80px]" placeholder="Brief excerpt..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Content</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field min-h-[150px]" placeholder="Post content..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })} className="input-field">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
