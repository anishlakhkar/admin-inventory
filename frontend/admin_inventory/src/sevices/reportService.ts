import api from './api';

// Report Request
export interface ReportRequest {
  reportType: 'inventory-valuation' | 'low-stock' | 'purchase-order';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  format: 'pdf' | 'xlsx' | 'csv';
}

// Inventory Valuation Report Response
export interface InventoryValuationReportResponse {
  reportName: string;
  generatedDate: string;
  startDate: string;
  endDate: string;
  format: string;
  totalValuation: number | string;
  warehouseValuations: WarehouseValuation[];
  productValuations: ProductValuation[];
}

export interface WarehouseValuation {
  warehouseId: string;
  warehouseName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number | string;
}

export interface ProductValuation {
  skuId: string;
  productName: string;
  category: string;
  warehouseId: string;
  quantity: number;
  unitPrice: number | string;
  totalValue: number | string;
}

// Low Stock Report Response
export interface LowStockReportResponse {
  reportName: string;
  generatedDate: string;
  startDate: string;
  endDate: string;
  format: string;
  totalLowStockItems: number;
  lowStockItems: LowStockItem[];
}

export interface LowStockItem {
  skuId: string;
  productName: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  threshold: number;
  shortage: number;
  daysUntilOut: number;
  priority: string;
}

// Purchase Order Report Response
export interface PurchaseOrderReportResponse {
  reportName: string;
  generatedDate: string;
  startDate: string;
  endDate: string;
  format: string;
  totalPurchaseOrders: number;
  totalAmount: number | string;
  statusSummary: PurchaseOrderStatusSummary[];
  purchaseOrders: PurchaseOrderSummary[];
}

export interface PurchaseOrderStatusSummary {
  status: string;
  count: number;
  totalAmount: number | string;
}

export interface PurchaseOrderSummary {
  poId: number;
  poNumber: string;
  orderId: number;
  status: string;
  totalAmount: number | string;
  createdAt: string;
  approvedRejectedAt?: string;
  approvedRejectedBy?: string;
}

// Recent Report Response
export interface RecentReportResponse {
  id: number;
  reportName: string;
  reportType: string;
  generatedDate: string;
  format: string;
  size: string;
  downloadUrl: string;
}

// Export Request
export interface ExportRequest {
  exportType: 'full-inventory' | 'low-stock' | 'expiry-data' | 'purchase-orders';
  startDate?: string; // Optional: ISO date string - if not provided, exports all data
  endDate?: string; // Optional: ISO date string - if not provided, exports all data
  format: 'pdf' | 'xlsx' | 'csv';
  warehouseId?: string; // Optional: filter by warehouse
}

export const reportService = {
  /**
   * Generate a report
   */
  generateReport: async (request: ReportRequest): Promise<InventoryValuationReportResponse | LowStockReportResponse | PurchaseOrderReportResponse> => {
    const response = await api.post<InventoryValuationReportResponse | LowStockReportResponse | PurchaseOrderReportResponse>(
      '/reports/generate',
      request
    );
    return response.data;
  },

  /**
   * Export data in various formats
   */
  exportData: async (request: ExportRequest): Promise<Blob> => {
    const response = await api.post(
      '/reports/export',
      request,
      { responseType: 'blob' }
    );
    return response.data as Blob;
  },

  /**
   * Get recent reports
   */
  getRecentReports: async (): Promise<RecentReportResponse[]> => {
    const response = await api.get<RecentReportResponse[]>('/reports/recent');
    return response.data;
  },
};
