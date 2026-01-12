import api from './api';

export interface Stock {
  skuId: string;
  warehouseId: string;
  warehouseName: string;
  productName: string;
  productSku: string;
  onHand: number;
  reserved: number;
  blocked: number;
  available: number;
  batches?: Array<{
    batchId: string;
    quantity: number;
    expiry: string;
  }>;
}

export interface StockUpdateRequest {
  warehouseId: string;
  skuId: string;
  quantity: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const stockService = {
  getAll: async (params?: {
    warehouseId?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Stock>> => {
    const response = await api.get<PageResponse<Stock>>('/stock', { params });
    return response.data;
  },

  getById: async (skuId: string, warehouseId: string = '001'): Promise<Stock> => {
    const response = await api.get<Stock>(`/stock/${skuId}`, {
      params: { warehouseId }
    });
    return response.data;
  },

  getLowStock: async (warehouseId?: string, threshold?: number): Promise<Stock[]> => {
    const params: any = {};
    if (warehouseId) params.warehouseId = warehouseId;
    if (threshold) params.threshold = threshold;
    const response = await api.get<Stock[]>('/stock/low-stock', { params });
    return response.data;
  },

  update: async (skuId: string, warehouseId: string, stock: StockUpdateRequest): Promise<Stock> => {
    const response = await api.put<Stock>(`/stock/${skuId}`, stock, {
      params: { warehouseId }
    });
    return response.data;
  },
};
