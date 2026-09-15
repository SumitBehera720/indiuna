import api from '@/lib/api';
import type { AuthResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
};
