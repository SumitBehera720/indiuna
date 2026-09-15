import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  searchable?: boolean;
  onSearch?: (query: string) => void;
  selected?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: string) => void;
}

export default function DataTable<T extends { id: string }>({
  columns, data, loading, onRowClick, pagination, searchable, onSearch, selected, onSelectAll, onSelectOne,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="card overflow-hidden">
      {(searchable || onSelectAll) && (
        <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700/50">
          {searchable && onSearch && (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => onSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 border border-surface-200 dark:border-surface-700"
              />
            </div>
          )}
          {onSelectAll && (
            <label className="flex items-center gap-2 text-sm text-surface-500">
              <input
                type="checkbox"
                checked={data.length > 0 && selected?.length === data.length}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-surface-300 text-primary-500 focus:ring-primary-500"
              />
              Select All
            </label>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100 dark:border-surface-700/50">
              {onSelectOne && <th className="px-4 py-3 text-left"><span className="sr-only">Select</span></th>}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider', col.sortable && 'cursor-pointer hover:text-surface-700 select-none')}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
                        : <ChevronsUpDown size={14} className="opacity-30" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: columns.length + (onSelectOne ? 1 : 0) }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-100 dark:bg-surface-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length + (onSelectOne ? 1 : 0)} className="px-4 py-12 text-center text-surface-400">No data found</td></tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50')}
                  onClick={() => onRowClick?.(item)}
                >
                  {onSelectOne && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected?.includes(item.id)}
                        onChange={() => onSelectOne(item.id)}
                        className="rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-surface-700 dark:text-surface-300">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 dark:border-surface-700/50">
          <p className="text-sm text-surface-500">Showing page {pagination.page} of {pagination.lastPage} ({pagination.total} total)</p>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(pagination.lastPage, 5) }).map((_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.page - 2, pagination.lastPage - 4)) + i;
              if (pageNum > pagination.lastPage) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    pageNum === pagination.page ? 'bg-primary-500 text-white' : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={pagination.page >= pagination.lastPage}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
