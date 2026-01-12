import api from './api';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  status: string;
  supplier: string;
  expectedDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderRequest {
  supplier: string;
  expectedDate?: string;
  items: PurchaseOrderItemRequest[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const purchaseOrderService = {
  getAll: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<PurchaseOrder>> => {
    const response = await api.get<PageResponse<PurchaseOrder>>('/purchase-orders', { params });
    return response.data;
  },

  getPending: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<PurchaseOrder>> => {
    const response = await api.get<PageResponse<PurchaseOrder>>('/purchase-orders/pending', { params });
    return response.data;
  },

  getById: async (id: string): Promise<PurchaseOrder> => {
    const response = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return response.data;
  },

  create: async (po: PurchaseOrderRequest): Promise<PurchaseOrder> => {
    const response = await api.post<PurchaseOrder>('/purchase-orders', po);
    return response.data;
  },

  approve: async (id: string): Promise<PurchaseOrder> => {
    const response = await api.put<PurchaseOrder>(`/purchase-orders/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason?: string): Promise<PurchaseOrder> => {
    const response = await api.put<PurchaseOrder>(`/purchase-orders/${id}/reject`, reason);
    return response.data;
  },
};

