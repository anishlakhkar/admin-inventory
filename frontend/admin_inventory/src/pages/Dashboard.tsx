import { AlertTriangle, Calendar, DollarSign, FileText, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dashboardService } from '../sevices/dashboardService';
import type { DashboardData } from '../sevices/dashboardService';

export default function Dashboard() {
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Fetch dashboard data when filters change
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseFilter, categoryFilter, statusFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard(warehouseFilter, categoryFilter, statusFilter);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty data on error so page still renders
      setDashboardData({
        summaryCards: {
          totalStockValue: 0,
          lowStockItems: 0,
          expiringSoon: 0,
          totalProducts: 0
        },
        stockData: [],
        lowStockAlerts: [],
        expiryData: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Always render something, even if loading or error
  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Overview of your inventory management system</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  // If no data after loading, show empty state
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Overview of your inventory management system</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Failed to load dashboard data. Please check if backend is running.</div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '$0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  const summaryCards = [
    { title: 'Total Stock Value', value: formatCurrency(dashboardData.summaryCards.totalStockValue), icon: DollarSign, color: 'blue' },
    { title: 'Low Stock Items', value: (dashboardData.summaryCards.lowStockItems || 0).toString(), icon: AlertTriangle, color: 'orange' },
    { title: 'Expiring Soon', value: (dashboardData.summaryCards.expiringSoon || 0).toString(), icon: Calendar, color: 'red' },
    { title: 'Total Products', value: (dashboardData.summaryCards.totalProducts || 0).toString(), icon: FileText, color: 'green' }
  ];

  const stockData = (dashboardData.stockData || []).map((item, idx) => ({
    id: idx + 1,
    name: item.productName || 'Unknown',
    sku: item.skuId || '',
    stock: typeof item.stock === 'number' ? item.stock : 0,
    warehouse: item.warehouse || 'Unknown',
    status: item.status || 'Unknown'
  }));

  const lowStockAlerts = dashboardData.lowStockAlerts || [];
  const expiryData = dashboardData.expiryData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Overview of your inventory management system</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
            red: { bg: 'bg-red-50', text: 'text-red-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600' }
          };
          const colors = colorClasses[card.color as keyof typeof colorClasses] || colorClasses.blue;
          return (
            <div key={idx} className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
              </div>
              <div className="text-2xl font-semibold mb-1 text-neutral-900">{card.value}</div>
              <div className="text-sm text-neutral-600">{card.title}</div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Stock Visibility */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Real-Time Stock Visibility</h2>
            <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select 
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Warehouses</option>
              <option value="001">Warehouse 001</option>
              <option value="002">Warehouse 002</option>
              <option value="003">Warehouse 003</option>
              <option value="004">Warehouse 004</option>
            </select>

            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="MEDICATIONS">Medications</option>
              <option value="SUPPLEMENTS">Supplements</option>
              <option value="EQUIPMENTS">Equipments</option>
              <option value="SUPPLIES">Supplies</option>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Product Name</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">SKU</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Current Stock</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Warehouse</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockData.length > 0 ? (
                stockData.map((item) => (
                  <tr key={item.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4 text-neutral-600">{item.sku}</td>
                    <td className="px-6 py-4">{item.stock}</td>
                    <td className="px-6 py-4 text-neutral-600">{item.warehouse}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'In Stock' ? 'bg-green-100 text-green-700' :
                        item.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                        item.status === 'Out of Stock' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No stock data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">Low Stock Alerts</h2>
        </div>
        <div className="p-6 space-y-3">
          {lowStockAlerts.length > 0 ? (
            lowStockAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <div>{alert.product}</div>
                    <div className="text-sm text-neutral-600">
                      Current: {alert.current} | Threshold: {alert.threshold} | {alert.warehouse}
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Reorder
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No low stock alerts
            </div>
          )}
        </div>
      </div>

      {/* Batch & Expiry Tracking */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">Batch & Expiry Tracking</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Batch No</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Product</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Expiry Date</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Quantity</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {expiryData.length > 0 ? (
                expiryData.map((item, idx) => (
                  <tr key={idx} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="px-6 py-4">{item.batch}</td>
                    <td className="px-6 py-4">{item.product}</td>
                    <td className="px-6 py-4">{item.expiry}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'Monitor' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'Expiring Soon' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No expiry data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
