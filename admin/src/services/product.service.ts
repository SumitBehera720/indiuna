import api from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

export const productService = {
  async getAll(params?: Record<string, any>): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get('/admin/products', { params });
    return { data: data.data, meta: data.meta };
  },
  async getById(id: string): Promise<Product> {
    const { data } = await api.get(`/admin/products/${id}`);
    return data.data;
  },
  async create(product: Partial<Product>): Promise<Product> {
    const { data } = await api.post('/admin/products', product);
    return data.data;
  },
  async update(id: string, product: Partial<Product>): Promise<Product> {
    const { data } = await api.put(`/admin/products/${id}`, product);
    return data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },
  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/admin/products/bulk-delete', { ids });
  },
  async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    await api.post('/admin/products/bulk-update-status', { ids, status });
  },
  async duplicate(id: string): Promise<Product> {
    const { data } = await api.post(`/admin/products/${id}/duplicate`);
    return data.data;
  },
};
