import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-info',
    completed: 'badge-success',
    shipped: 'badge-info',
    in_transit: 'badge-info',
    out_for_delivery: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
    refunded: 'badge-danger',
    failed: 'badge-danger',
    returned: 'badge-danger',
    published: 'badge-success',
    draft: 'badge-neutral',
    archived: 'badge-neutral',
    approved: 'badge-success',
    rejected: 'badge-danger',
    active: 'badge-success',
    inactive: 'badge-neutral',
  };
  return map[status?.toLowerCase()] || 'badge-neutral';
}
