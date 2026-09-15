import { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { cn, getStatusColor, formatDate } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import toast from 'react-hot-toast';

interface ReviewItem {
  id: string;
  product: { id: string; name: string; image?: string };
  customer: { id: string; name: string; email: string; avatar?: string };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const tabs = ['all', 'pending', 'approved', 'rejected'] as const;
type Tab = typeof tabs[number];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const statusParam = activeTab === 'all' ? undefined : activeTab;
      const { data } = await api.get('/admin/reviews', { params: { page, status: statusParam } });
      setReviews(data.data ?? []);
      if (data.meta) {
        setLastPage(data.meta.last_page ?? 1);
        setTotal(data.meta.total ?? 0);
      }
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleStatus = async (item: ReviewItem, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/admin/reviews/${item.id}`, { status });
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (item: ReviewItem) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${item.id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={cn(i < rating ? 'fill-amber-400 text-amber-400' : 'text-surface-300 dark:text-surface-600')}
        />
      ))}
    </div>
  );

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (item: ReviewItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 text-xs font-medium overflow-hidden">
            {item.product.image ? (
              <img src={item.product.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <MessageSquare size={14} />
            )}
          </div>
          <span className="font-medium text-surface-700 dark:text-surface-300 truncate max-w-[200px]">
            {item.product.name}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item: ReviewItem) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-semibold">
            {item.customer.name.charAt(0)}
          </div>
          <span className="text-surface-700 dark:text-surface-300">{item.customer.name}</span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (item: ReviewItem) => renderStars(item.rating),
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (item: ReviewItem) => (
        <span className="text-surface-500 truncate max-w-[250px] block">
          {item.comment.length > 60 ? `${item.comment.slice(0, 60)}...` : item.comment}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ReviewItem) => (
        <span className={cn('badge', getStatusColor(item.status))}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (item: ReviewItem) => (
        <span className="text-surface-500 text-sm">{formatDate(item.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ReviewItem) => (
        <div className="flex items-center gap-1">
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatus(item, 'approved')}
                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-surface-400 hover:text-emerald-600"
                title="Approve"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => handleStatus(item, 'rejected')}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-600"
                title="Reject"
              >
                <X size={14} />
              </button>
            </>
          )}
          <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-red-500">
            <X size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Reviews</h1>
        <p className="text-sm text-surface-400 mt-1">Moderate customer reviews</p>
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
          <button onClick={fetchReviews} className="btn-secondary">Retry</button>
        </div>
      )}

      {!error && (
        <DataTable<ReviewItem>
          columns={columns}
          data={reviews}
          loading={loading}
          pagination={{ page, lastPage, total, onPageChange: setPage }}
        />
      )}
    </div>
  );
}
