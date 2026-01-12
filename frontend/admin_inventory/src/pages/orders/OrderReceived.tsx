import { AlertCircle, Building2, Calendar, CheckCircle, Clock, DollarSign, Eye, Filter, Loader2, Mail, Package, Receipt, ShoppingBag, User, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { orderService, OrderStatus, OrderType, purchaseOrderService, PurchaseOrderStatus, type OrderResponse } from '../../sevices/orderService';
// import { authService } from '../../sevices/authService';

// Add CSS animations
const modalStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;

export default function OrderReceived() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'B2B' | 'B2C'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [poStatusFilter, setPoStatusFilter] = useState<'all' | PurchaseOrderStatus>('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingPoId, setRejectingPoId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const allOrders = await orderService.getAllOrders();
      setOrders(allOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: OrderResponse) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleApprovePO = async (poId: number) => {
    try {
      setActionLoading(poId);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      await purchaseOrderService.updatePurchaseOrderStatus(poId, {
        adminUserId: parseInt(userId),
        status: PurchaseOrderStatus.APPROVED,
      });

      // Refresh orders
      await fetchOrders();
      setShowOrderModal(false);
      setSelectedOrder(null);
    } catch (err: any) {
      console.error('Error approving PO:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve purchase order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPO = async (poId: number) => {
    if (!rejectComment.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(poId);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      await purchaseOrderService.updatePurchaseOrderStatus(poId, {
        adminUserId: parseInt(userId),
        status: PurchaseOrderStatus.REJECTED,
        comments: rejectComment,
      });

      // Refresh orders
      await fetchOrders();
      setShowOrderModal(false);
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectComment('');
      setRejectingPoId(null);
    } catch (err: any) {
      console.error('Error rejecting PO:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reject purchase order');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (poId: number) => {
    setRejectingPoId(poId);
    setShowRejectModal(true);
    setRejectComment('');
  };

  const filteredOrders = orders.filter(order => {
    if (typeFilter !== 'all' && order.orderType !== typeFilter) return false;
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (poStatusFilter !== 'all') {
      if (order.orderType === OrderType.B2B) {
        if (!order.purchaseOrder) return false;
        if (order.purchaseOrder.status !== poStatusFilter) return false;
      } else {
        return false; // B2C orders don't have POs
      }
    }
    return true;
  });

  // Calculate stats
  const processingOrders = orders.filter(o => o.status === OrderStatus.PROCESSING).length;
  const confirmedOrders = orders.filter(o => o.status === OrderStatus.CONFIRMED).length;
  const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED).length;
  const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
  const pendingPOs = orders.filter(o => 
    o.orderType === OrderType.B2B && 
    o.purchaseOrder && 
    o.purchaseOrder.status === PurchaseOrderStatus.PENDING
  ).length;

  // Helper function to map order type to display label
  const getOrderTypeLabel = (orderType: string): string => {
    switch (orderType) {
      case 'B2C': return 'MedBuddy';
      case 'B2B': return 'MedBiz';
      default: return orderType;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PROCESSING:
        return 'bg-orange-100 text-orange-700';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-700';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-700';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-700';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getPOStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      case PurchaseOrderStatus.APPROVED:
        return 'bg-green-100 text-green-700';
      case PurchaseOrderStatus.REJECTED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getCustomerName = (order: OrderResponse) => {
    if (order.user.firstName && order.user.lastName) {
      return `${order.user.firstName} ${order.user.lastName}`;
    }
    return order.user.email;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#461E96]" />
      </div>
    );
  }

  return (
    <>
      <style>{modalStyles}</style>
      <div className="space-y-6">
        <div>
          <h1>Orders Received</h1>
          <p className="text-neutral-600 mt-1">Manage incoming orders from MedBuddy and MedBiz customers</p>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl">{processingOrders}</div>
          </div>
          <div className="text-sm text-neutral-600">Processing</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">{confirmedOrders}</div>
          </div>
          <div className="text-sm text-neutral-600">Confirmed</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl">{shippedOrders}</div>
          </div>
          <div className="text-sm text-neutral-600">Shipped</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl">{deliveredOrders}</div>
          </div>
          <div className="text-sm text-neutral-600">Delivered</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-2xl">{pendingPOs}</div>
          </div>
          <div className="text-sm text-neutral-600">Pending POs</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-neutral-600" />
          <h2>Filters</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'B2B' | 'B2C')}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
          >
            <option value="all">All Types</option>
            <option value="B2C">MedBuddy</option>
            <option value="B2B">MedBiz</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
          >
            <option value="all">All Status</option>
            <option value={OrderStatus.PROCESSING}>Processing</option>
            <option value={OrderStatus.CONFIRMED}>Confirmed</option>
            <option value={OrderStatus.SHIPPED}>Shipped</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
            <option value={OrderStatus.CANCELLED}>Cancelled</option>
          </select>

          <select
            value={poStatusFilter}
            onChange={(e) => setPoStatusFilter(e.target.value as 'all' | PurchaseOrderStatus)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
          >
            <option value="all">All PO Status</option>
            <option value={PurchaseOrderStatus.PENDING}>Pending PO</option>
            <option value={PurchaseOrderStatus.APPROVED}>Approved PO</option>
            <option value={PurchaseOrderStatus.REJECTED}>Rejected PO</option>
          </select>

          {(typeFilter !== 'all' || statusFilter !== 'all' || poStatusFilter !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setPoStatusFilter('all');
              }}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Orders ({filteredOrders.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Order #</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Type</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Customer</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Items</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Amount</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Order Status</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">PO Status</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Date</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-neutral-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="px-6 py-4">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                        order.orderType === OrderType.B2C 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {order.orderType === OrderType.B2C ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        {getOrderTypeLabel(order.orderType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getCustomerName(order)}</td>
                    <td className="px-6 py-4">{order.orderItems.length}</td>
                    <td className="px-6 py-4">${order.totalAmt.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.purchaseOrder ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${getPOStatusColor(order.purchaseOrder.status)}`}>
                          {order.purchaseOrder.status}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOrderModal(false);
              setSelectedOrder(null);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#461E96] to-[#6B2ECC] text-white px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="bg-white text-[#461E96] hover:bg-neutral-100 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-md border border-white/20"
                  title="Close"
                >
                  <span>Close</span>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">

              {!selectedOrder ? (
                <div className="p-8 text-center text-neutral-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Loading order details...</p>
                </div>
              ) : (
                <>
                  {/* Order Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-sm text-neutral-600 font-medium">Customer</div>
                      </div>
                      <div className="font-semibold text-neutral-900 ml-11">{getCustomerName(selectedOrder)}</div>
                      <div className="text-sm text-neutral-600 ml-11 mt-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedOrder.user?.email || 'N/A'}
                      </div>
                    </div>

                    {selectedOrder.purchaseOrder && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-purple-500 p-2 rounded-lg">
                            <Receipt className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-sm text-neutral-600 font-medium">Purchase Order</div>
                        </div>
                        <div className="font-mono font-semibold text-neutral-900 ml-11">{selectedOrder.purchaseOrder.poNumber}</div>
                        <div className="ml-11 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPOStatusColor(selectedOrder.purchaseOrder.status)}`}>
                            {selectedOrder.purchaseOrder.status}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedOrder.purchaseOrder?.comments && (
                      <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-sm font-semibold text-neutral-700 mb-2">PO Comments</div>
                        <div className="text-sm text-neutral-600 bg-white p-3 rounded border border-yellow-100">
                          {selectedOrder.purchaseOrder.comments}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Items - Detailed Table */}
                  <div className="border-t border-neutral-200 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-[#461E96] p-2 rounded-lg">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900">Medicines Purchased</h3>
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-semibold">
                        {selectedOrder.orderItems?.length || 0} items
                      </span>
                    </div>
                    {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                      <>
                        <div className="overflow-x-auto rounded-lg border border-neutral-200">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100/50 border-b-2 border-neutral-200">
                                <th className="text-left px-5 py-4 text-xs font-bold text-neutral-700 uppercase tracking-wider">Product ID</th>
                                <th className="text-left px-5 py-4 text-xs font-bold text-neutral-700 uppercase tracking-wider">Medicine Name</th>
                                <th className="text-left px-5 py-4 text-xs font-bold text-neutral-700 uppercase tracking-wider">SKU</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-neutral-700 uppercase tracking-wider" style={{ textAlign: 'right' }}>Quantity</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-neutral-700 uppercase tracking-wider" style={{ textAlign: 'right' }}>Unit Price</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-neutral-700 uppercase tracking-wider" style={{ textAlign: 'right' }}>Total Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {selectedOrder.orderItems.map((item, index) => (
                                <tr 
                                  key={item.id || index} 
                                  className={`hover:bg-blue-50/50 transition-colors ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'
                                  }`}
                                >
                                  <td className="px-5 py-4 text-sm font-mono text-neutral-600 font-semibold">
                                    #{item.productId}
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="font-semibold text-neutral-900">{item.productName || 'N/A'}</div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="text-sm text-neutral-600 font-mono bg-neutral-100 px-2 py-1 rounded inline-block">
                                      {item.productSku || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-sm text-neutral-700 font-semibold" style={{ textAlign: 'right' }}>
                                    <div className="flex justify-end">
                                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                        {item.quantity}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-sm text-neutral-700 font-medium" style={{ textAlign: 'right' }}>
                                    ${(item.unitPrice || 0).toFixed(2)}
                                  </td>
                                  <td className="px-5 py-4 font-bold text-neutral-900 text-base" style={{ textAlign: 'right' }}>
                                    ${(item.totalPrice || 0).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Total Calculation */}
                        <div className="mt-6 bg-gradient-to-r from-[#461E96]/5 to-[#6B2ECC]/5 border-2 border-[#461E96]/20 rounded-xl p-6">
                          <div className="flex justify-end">
                            <div className="w-full max-w-md space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-600 font-medium">Subtotal:</span>
                                <span className="font-semibold text-neutral-700 text-base">${(selectedOrder.subtotalAmt || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-600 font-medium">Total Items:</span>
                                <span className="font-semibold text-neutral-700">{selectedOrder.orderItems.length} items</span>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t-2 border-[#461E96]/20">
                                <span className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                  <DollarSign className="w-5 h-5" />
                                  Total Amount:
                                </span>
                                <span className="text-2xl font-bold text-[#461E96]">${(selectedOrder.totalAmt || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-neutral-500 border border-neutral-200 rounded-lg">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No items found in this order</p>
                      </div>
                    )}
                  </div>

                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject PO Modal */}
      {showRejectModal && rejectingPoId && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Reject Purchase Order</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingPoId(null);
                  setRejectComment('');
                }}
                className="text-neutral-500 hover:text-neutral-700 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Please provide a reason for rejecting this purchase order.
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461E96] mb-4"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingPoId(null);
                  setRejectComment('');
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectPO(rejectingPoId)}
                disabled={!rejectComment.trim() || actionLoading === rejectingPoId}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === rejectingPoId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject PO
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
