import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Loader2, Filter } from 'lucide-react';
import { orderService, purchaseOrderService, OrderType, PurchaseOrderStatus, type OrderResponse } from '../../sevices/orderService';

export default function Approvals() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poStatusFilter, setPoStatusFilter] = useState<'all' | PurchaseOrderStatus>('all');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPoId, setRejectPoId] = useState<number | 'bulk' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchB2BOrders();
  }, []);

  const fetchB2BOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const allOrders = await orderService.getAllOrders();
      // Filter only B2B orders that have purchase orders
      const b2bOrdersWithPOs = allOrders.filter(
        order => order.orderType === OrderType.B2B && order.purchaseOrder
      );
      setOrders(b2bOrdersWithPOs);
    } catch (err: any) {
      console.error('Error fetching B2B orders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (poId: number) => {
    try {
      setActionLoading(poId);
      setError(null);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      await purchaseOrderService.updatePurchaseOrderStatus(poId, {
        adminUserId: parseInt(userId),
        status: PurchaseOrderStatus.APPROVED,
      });

      // Refresh orders
      await fetchB2BOrders();
      setSelectedOrders(prev => prev.filter(id => id !== poId));
    } catch (err: any) {
      console.error('Error approving PO:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve purchase order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (poId: number) => {
    setRejectPoId(poId);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleBulkApprove = async () => {
    if (selectedOrders.length === 0) {
      setError('Please select purchase orders to approve');
      return;
    }

    try {
      setError(null);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Approve all selected POs
      await Promise.all(
        selectedOrders.map(poId =>
          purchaseOrderService.updatePurchaseOrderStatus(poId, {
            adminUserId: parseInt(userId),
            status: PurchaseOrderStatus.APPROVED,
          })
        )
      );

      // Refresh orders
      await fetchB2BOrders();
      setSelectedOrders([]);
    } catch (err: any) {
      console.error('Error bulk approving POs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve purchase orders');
    }
  };

  const handleBulkReject = () => {
    if (selectedOrders.length === 0) {
      setError('Please select purchase orders to reject');
      return;
    }
    setRejectPoId('bulk');
    setShowRejectModal(true);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setError(null);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      if (rejectPoId === 'bulk') {
        // Reject all selected POs
        await Promise.all(
          selectedOrders.map(poId =>
            purchaseOrderService.updatePurchaseOrderStatus(poId, {
              adminUserId: parseInt(userId),
              status: PurchaseOrderStatus.REJECTED,
              comments: rejectReason,
            })
          )
        );
        setSelectedOrders([]);
      } else if (rejectPoId !== null) {
        await purchaseOrderService.updatePurchaseOrderStatus(rejectPoId, {
          adminUserId: parseInt(userId),
          status: PurchaseOrderStatus.REJECTED,
          comments: rejectReason,
        });
      }

      // Refresh orders
      await fetchB2BOrders();
      setShowRejectModal(false);
      setRejectReason('');
      setRejectPoId(null);
    } catch (err: any) {
      console.error('Error rejecting PO:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reject purchase order');
    }
  };

  const getCustomerName = (order: OrderResponse) => {
    if (order.user.firstName && order.user.lastName) {
      return `${order.user.firstName} ${order.user.lastName}`;
    }
    return order.user.email;
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

  // Filter orders based on PO status
  const filteredOrders = orders.filter(order => {
    if (poStatusFilter === 'all') return true;
    return order.purchaseOrder?.status === poStatusFilter;
  });

  const pendingOrders = orders.filter(o => o.purchaseOrder?.status === PurchaseOrderStatus.PENDING);
  const totalPendingAmount = pendingOrders.reduce((sum, o) => sum + (o.purchaseOrder?.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#461E96]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Purchase Order Approvals</h1>
        <p className="text-neutral-600 mt-1">Review and approve pending purchase orders for B2B orders</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl">{pendingOrders.length}</div>
          </div>
          <div className="text-sm text-neutral-600">Pending Approval</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">${totalPendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="text-sm text-neutral-600">Total Pending Value</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl">{orders.filter(o => o.purchaseOrder?.status === PurchaseOrderStatus.APPROVED).length}</div>
          </div>
          <div className="text-sm text-neutral-600">Approved</div>
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
            value={poStatusFilter}
            onChange={(e) => setPoStatusFilter(e.target.value as 'all' | PurchaseOrderStatus)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
          >
            <option value="all">All PO Status</option>
            <option value={PurchaseOrderStatus.PENDING}>Pending</option>
            <option value={PurchaseOrderStatus.APPROVED}>Approved</option>
            <option value={PurchaseOrderStatus.REJECTED}>Rejected</option>
          </select>

          {poStatusFilter !== 'all' && (
            <button
              onClick={() => setPoStatusFilter('all')}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {pendingOrders.length > 0 && poStatusFilter === 'all' && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              {selectedOrders.length} order(s) selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkApprove}
                disabled={selectedOrders.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Approve Selected
              </button>
              <button
                onClick={handleBulkReject}
                disabled={selectedOrders.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Reject Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Approval Queue ({filteredOrders.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pendingPoIds = pendingOrders
                          .filter(o => o.purchaseOrder)
                          .map(o => o.purchaseOrder!.poId);
                        setSelectedOrders(pendingPoIds);
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                    checked={selectedOrders.length === pendingOrders.length && pendingOrders.length > 0}
                    className="w-4 h-4"
                  />
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Order Number</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">PO Number</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Customer</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">PO Amount</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Items</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Created Date</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">PO Status</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-neutral-500">
                    {orders.length === 0 
                      ? 'No B2B orders with purchase orders found'
                      : `No ${poStatusFilter === 'all' ? '' : poStatusFilter.toLowerCase()} purchase orders found`}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const po = order.purchaseOrder!;
                  const isPending = po.status === PurchaseOrderStatus.PENDING;
                  return (
                    <tr key={order.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        {isPending && (
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(po.poId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders([...selectedOrders, po.poId]);
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== po.poId));
                              }
                            }}
                            className="w-4 h-4"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                      <td className="px-6 py-4 font-mono">{po.poNumber}</td>
                      <td className="px-6 py-4">{getCustomerName(order)}</td>
                      <td className="px-6 py-4">${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">{order.orderItems.length}</td>
                      <td className="px-6 py-4 text-neutral-600 text-sm">{formatDate(po.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPOStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(po.poId)}
                                disabled={actionLoading === po.poId}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                              >
                                {actionLoading === po.poId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(po.poId)}
                                disabled={actionLoading === po.poId}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {filteredOrders.length} of {orders.length} purchase order(s)
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Reject Purchase Order{rejectPoId === 'bulk' ? 's' : ''}</h3>
                <p className="text-sm text-neutral-600">Please provide a reason</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
                rows={4}
                placeholder="e.g., Budget exceeded, unauthorized request, duplicate order..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectPoId(null);
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
