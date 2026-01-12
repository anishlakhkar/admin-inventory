import api from './api';

export interface Product {
  skuId: string;
  warehouseId: string;
  productName: string;
  manufactureName: string;
  category: string;
  description?: string;
  storageType: string;
  quantity: number;
  price: number;
  profitMargin: number;
  requiredPrescription: boolean;
  url?: string;
  dosageForm: string;
  thresholdQuantity: number;
  strength?: string;
  concern?: string;
  personaType?: 'B2B' | 'B2C' | 'BOTH';
}

export interface ProductRequest {
  skuId: string;
  warehouseId: string;
  productName: string;
  manufactureName: string;
  category: string;
  description?: string;
  storageType: string;
  price: number;
  profitMargin?: number;
  requiredPrescription?: boolean;
  url?: string;
  dosageForm: string;
  thresholdQuantity: number;
  strength?: string;
  concern?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const productService = {
  getAll: async (params?: {
    warehouseId?: string;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'ASC' | 'DESC';
  }): Promise<PageResponse<Product>> => {
    const response = await api.get<PageResponse<Product>>('/products', { params });
    return response.data;
  },

  getById: async (skuId: string, warehouseId: string = '001'): Promise<Product> => {
    const response = await api.get<Product>(`/products/${skuId}`, {
      params: { warehouseId }
    });
    return response.data;
  },

  create: async (product: ProductRequest): Promise<Product> => {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },

  update: async (skuId: string, warehouseId: string, product: ProductRequest): Promise<Product> => {
    const response = await api.put<Product>(`/products/${skuId}`, product, {
      params: { warehouseId }
    });
    return response.data;
  },

  delete: async (skuId: string, warehouseId: string = '001'): Promise<void> => {
    await api.delete(`/products/${skuId}`, {
      params: { warehouseId }
    });
  },

  updatePersonaType: async (
    skuId: string,
    warehouseId: string,
    personaType: 'B2B' | 'B2C' | 'BOTH'
  ): Promise<Product> => {
    const response = await api.put<Product>(
      `/products/${skuId}/persona-type`,
      { personaType },
      { params: { warehouseId } }
    );
    return response.data;
  },
};
