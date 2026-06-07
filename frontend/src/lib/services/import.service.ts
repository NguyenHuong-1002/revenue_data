import api from '@/lib/axios';

export const importService = {
  importProducts(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{
      success: boolean;
      message: string;
      stats: { total: number; inserted: number; skipped: number };
    }>('/import/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  importSales(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{
      success: boolean;
      message: string;
      stats: { total: number; inserted: number; skipped: number };
    }>('/import/sales', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  importInventory(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{
      success: boolean;
      message: string;
      stats: { total: number; inserted: number; skipped: number };
    }>('/import/inventory', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export type ImportService = typeof importService;
