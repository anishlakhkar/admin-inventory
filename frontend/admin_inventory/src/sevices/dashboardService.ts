import api from './api';

export interface DashboardData {
  summaryCards: SummaryCards;
  stockData: StockItem[];
  lowStockAlerts: LowStockAlert[];
  expiryData: ExpiryItem[];
}

export interface SummaryCards {
  totalStockValue: number | string; // Backend returns BigDecimal as string
  lowStockItems: number;
  expiringSoon: number;
  totalProducts: number;
}

export interface StockItem {
  skuId: string;
  productName: string;
  stock: number;
  warehouse: string;
  status: string;
}

export interface LowStockAlert {
  product: string;
  sku: string;
  current: number;
  threshold: number;
  warehouse: string;
}

export interface ExpiryItem {
  batch: string;
  product: string;
  expiry: string;
  quantity: number;
  status: string;
}

export const dashboardService = {
  getDashboard: async (
    warehouseId: string = 'all',
    category?: string,
    status?: string
  ): Promise<DashboardData> => {
    const params: any = { warehouseId };
    if (category && category !== 'all') {
      params.category = category;
    }
    if (status && status !== 'all') {
      params.status = status;
    }
    const response = await api.get<DashboardData>('/dashboard', { params });
    return response.data;
  },
};
