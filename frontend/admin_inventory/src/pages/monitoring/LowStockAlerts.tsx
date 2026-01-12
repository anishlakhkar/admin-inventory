import { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { monitoringService, type LowStockAlertResponse } from '../../sevices/monitoringService';

interface Alert {
  id: string;
  product: string;
  sku: string;
  current: number;
  threshold: number;
  warehouse: string;
  daysUntilOut: number;
  priority: string;
}

export default function LowStockAlerts() {
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Fetch low stock alerts from API
  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseFilter, categoryFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const category = categoryFilter === 'all' ? undefined : categoryFilter;
      const response = await monitoringService.getLowStockAlerts(warehouseFilter, category);
      
      // Map backend response to display format
      const mappedAlerts: Alert[] = response.map((item) => ({
        id: item.skuId,
        product: item.productName,
        sku: item.skuId,
        current: item.currentStock,
        threshold: item.threshold,
        warehouse: item.warehouse,
        daysUntilOut: item.daysUntilOut,
        priority: item.priority
      }));
      
      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Error loading low stock alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Low Stock Alerts</h1>
        <p className="text-neutral-600 mt-1">Items requiring immediate attention</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl">{alerts.filter(a => a.priority === 'Critical').length}</div>
          </div>
          <div className="text-sm text-neutral-600">Critical Alerts</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl">{alerts.filter(a => a.priority === 'High').length}</div>
          </div>
          <div className="text-sm text-neutral-600">High Priority</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">{alerts.length}</div>
          </div>
          <div className="text-sm text-neutral-600">Total Alerts</div>
        </div>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center text-neutral-600">
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center text-neutral-600">
          No low stock alerts found. All products are above threshold.
        </div>
      ) : (
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className={`bg-white rounded-lg border-2 p-6 ${getPriorityColor(alert.priority)}`}>
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  alert.priority === 'Critical' ? 'bg-red-200' :
                  alert.priority === 'High' ? 'bg-orange-200' :
                  'bg-yellow-200'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    alert.priority === 'Critical' ? 'text-red-700' :
                    alert.priority === 'High' ? 'text-orange-700' :
                    'text-yellow-700'
                  }`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">{alert.product}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.priority === 'Critical' ? 'bg-red-600 text-white' :
                      alert.priority === 'High' ? 'bg-orange-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {alert.priority}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-600">SKU</div>
                      <div>{alert.sku}</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Current Stock</div>
                      <div>{alert.current} units</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Threshold</div>
                      <div>{alert.threshold} units</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Warehouse</div>
                      <div>{alert.warehouse}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>Estimated {alert.daysUntilOut} days until out of stock</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                      <span>Stock Level</span>
                      <span>{Math.round((alert.current / alert.threshold) * 100)}% of threshold</span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          alert.priority === 'Critical' ? 'bg-red-600' :
                          alert.priority === 'High' ? 'bg-orange-600' :
                          'bg-yellow-600'
                        }`}
                        style={{ width: `${Math.min((alert.current / alert.threshold) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

    </div>
  );
}
