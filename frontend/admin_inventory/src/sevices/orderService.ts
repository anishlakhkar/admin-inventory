import api from './api';

export enum OrderType {
  B2B = 'B2B',
  B2C = 'B2C'
}

export enum OrderStatus {
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface UserResponse {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNo?: string;
  userTypes: string[];
}

export interface PurchaseOrderResponse {
  poId: number;
  poNumber: string;
  orderId: number;
  status: PurchaseOrderStatus;
  totalAmount: number;
  comments?: string;
  approvedRejectedBy?: UserResponse;
  createdAt: string;
  approvedRejectedAt?: string;
  updatedAt: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PrescriptionResponse {
  id: number;
  prescriptionNumber: string;
  status: string;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface OrderResponse {
  id: number;
  user: UserResponse;
  orderType: OrderType;
  orderNumber: string;
  subtotalAmt: number;
  totalAmt: number;
  status: OrderStatus;
  purchaseOrder?: PurchaseOrderResponse;
  prescriptionRequired: boolean;
  prescription?: PrescriptionResponse;
  orderItems: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePurchaseOrderStatusRequest {
  adminUserId: number;
  status: PurchaseOrderStatus;
  comments?: string;
}

export const orderService = {
  getAllOrders: async (): Promise<OrderResponse[]> => {
    const response = await api.get<OrderResponse[]>('/orders');
    return response.data;
  },

  getOrderById: async (id: number): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  getOrdersByType: async (orderType: OrderType): Promise<OrderResponse[]> => {
    const response = await api.get<OrderResponse[]>(`/orders?orderType=${orderType}`);
    return response.data;
  },

  getOrdersByStatus: async (status: OrderStatus): Promise<OrderResponse[]> => {
    const response = await api.get<OrderResponse[]>(`/orders?status=${status}`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: OrderStatus): Promise<OrderResponse> => {
    const response = await api.put<OrderResponse>(`/orders/${id}`, { status });
    return response.data;
  },
};

export const purchaseOrderService = {
  getAllPurchaseOrders: async (): Promise<PurchaseOrderResponse[]> => {
    const response = await api.get<PurchaseOrderResponse[]>('/purchase-orders');
    return response.data;
  },

  getPurchaseOrderById: async (id: number): Promise<PurchaseOrderResponse> => {
    const response = await api.get<PurchaseOrderResponse>(`/purchase-orders/${id}`);
    return response.data;
  },

  getPurchaseOrderByOrderId: async (orderId: number): Promise<PurchaseOrderResponse | null> => {
    try {
      const response = await api.get<PurchaseOrderResponse>(`/purchase-orders/order/${orderId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getPurchaseOrdersByStatus: async (status: PurchaseOrderStatus): Promise<PurchaseOrderResponse[]> => {
    const response = await api.get<PurchaseOrderResponse[]>(`/purchase-orders?status=${status}`);
    return response.data;
  },

  updatePurchaseOrderStatus: async (
    poId: number,
    request: UpdatePurchaseOrderStatusRequest
  ): Promise<PurchaseOrderResponse> => {
    const response = await api.put<PurchaseOrderResponse>(`/purchase-orders/${poId}/status`, request);
    return response.data;
  },
};
