import api from './api';

// Stock Level Response
export interface StockLevelResponse {
  skuId: string;
  productName: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  warehouse: string;
  status: string; // Optimal, Below Min, Critical
}

// Low Stock Alert Response
export interface LowStockAlertResponse {
  skuId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  warehouse: string;
  daysUntilOut: number;
  priority: string; // Critical, High, Medium
}

// Expiry Tracking Response
export interface ExpiryTrackingResponse {
  batchId: string;
  productName: string;
  skuId: string;
  expiry: string; // ISO date string
  quantity: number;
  warehouse: string;
  daysLeft: number;
  status: string; // Critical, Expiring Soon, Monitor, Good
}

export const monitoringService = {
  /**
   * Get stock levels for all products
   * @param warehouseId - Warehouse ID (default: '001')
   * @param category - Optional category filter
   * @param status - Optional status filter (Optimal, Below Min, Critical)
   */
  getStockLevels: async (
    warehouseId: string = 'all',
    category?: string,
    status?: string
  ): Promise<StockLevelResponse[]> => {
    const params: any = { warehouseId };
    if (category && category !== 'all') {
      params.category = category;
    }
    if (status && status !== 'all') {
      params.status = status;
    }
    const response = await api.get<StockLevelResponse[]>('/monitoring/stock-levels', { params });
    return response.data;
  },

  /**
   * Get low stock alerts
   * @param warehouseId - Warehouse ID (default: '001')
   * @param category - Optional category filter
   */
  getLowStockAlerts: async (
    warehouseId: string = 'all',
    category?: string
  ): Promise<LowStockAlertResponse[]> => {
    const params: any = { warehouseId };
    if (category && category !== 'all') {
      params.category = category;
    }
    const response = await api.get<LowStockAlertResponse[]>('/monitoring/low-stock-alerts', { params });
    return response.data;
  },

  /**
   * Get expiry tracking data
   * @param warehouseId - Warehouse ID (default: '001')
   * @param category - Optional category filter
   * @param daysFilter - Optional days filter (30, 60, 90)
   */
  getExpiryTracking: async (
    warehouseId: string = 'all',
    category?: string,
    daysFilter?: number
  ): Promise<ExpiryTrackingResponse[]> => {
    const params: any = { warehouseId };
    if (category && category !== 'all') {
      params.category = category;
    }
    if (daysFilter) {
      params.daysFilter = daysFilter;
    }
    const response = await api.get<ExpiryTrackingResponse[]>('/monitoring/expiry-tracking', { params });
    return response.data;
  },
};
