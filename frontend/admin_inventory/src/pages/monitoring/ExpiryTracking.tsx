import { useState, useEffect } from "react";
import { Calendar, AlertTriangle, Filter } from "lucide-react";
import { monitoringService, type ExpiryTrackingResponse } from '../../sevices/monitoringService';

interface ExpiryItem {
  id: string;
  batch: string;
  product: string;
  sku: string;
  expiry: string;
  quantity: number;
  warehouse: string;
  daysLeft: number;
  status: string;
}

export default function ExpiryTracking() {
  const [timeFilter, setTimeFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [expiryData, setExpiryData] = useState<ExpiryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch expiry tracking data from API
  useEffect(() => {
    loadExpiryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseFilter, categoryFilter, timeFilter]);

  const loadExpiryData = async () => {
    try {
      setLoading(true);
      const category = categoryFilter === "all" ? undefined : categoryFilter;
      const daysFilter = timeFilter === "all" ? undefined : parseInt(timeFilter);
      
      const response = await monitoringService.getExpiryTracking(
        warehouseFilter,
        category,
        daysFilter
      );
      
      // Map backend response to display format
      const mappedData: ExpiryItem[] = response.map((item) => ({
        id: item.batchId,
        batch: item.batchId,
        product: item.productName,
        sku: item.skuId,
        expiry: item.expiry.split('T')[0], // Extract date part from ISO string
        quantity: item.quantity,
        warehouse: item.warehouse,
        daysLeft: item.daysLeft,
        status: item.status
      }));
      
      setExpiryData(mappedData);
    } catch (error) {
      console.error('Error loading expiry tracking data:', error);
      setExpiryData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = expiryData; // Already filtered by API

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-red-100 text-red-700";
      case "Expiring Soon":
        return "bg-orange-100 text-orange-700";
      case "Monitor":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getWarehouseId = (warehouse: string): string => {
    // Extract warehouse ID from "Warehouse 003" format
    const match = warehouse.match(/(\d+)/);
    return match ? match[1] : warehouse;
  };

  const handleNotifyWarehouse = (warehouse: string) => {
    const warehouseId = getWarehouseId(warehouse);
    setToastMessage(`✓ Notification sent to Warehouse ${warehouseId}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-5">
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1>Expiry Tracking</h1>
        <p className="text-neutral-600 mt-1">
          Monitor batch expiry dates and prevent stock waste
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl">
              {expiryData.filter((e) => e.status === "Critical").length}
            </div>
          </div>
          <div className="text-sm text-neutral-600">Critical (≤15 days)</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl">
              {expiryData.filter((e) => e.status === "Expiring Soon").length}
            </div>
          </div>
          <div className="text-sm text-neutral-600">
            Expiring Soon (≤60 days)
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-2xl">
              {expiryData.filter((e) => e.status === "Monitor").length}
            </div>
          </div>
          <div className="text-sm text-neutral-600">Monitor (≤90 days)</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">
              {expiryData.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </div>
          <div className="text-sm text-neutral-600">Total Units Tracked</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-neutral-600" />
          <h2>Filters</h2>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
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
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setTimeFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeFilter === "all"
                ? "bg-blue-600 text-white"
                : "border border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setTimeFilter("30")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeFilter === "30"
                ? "bg-blue-600 text-white"
                : "border border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            Within 30 Days
          </button>
          <button
            onClick={() => setTimeFilter("60")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeFilter === "60"
                ? "bg-blue-600 text-white"
                : "border border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            Within 60 Days
          </button>
          <button
            onClick={() => setTimeFilter("90")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeFilter === "90"
                ? "bg-blue-600 text-white"
                : "border border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            Within 90 Days
          </button>
        </div>
      </div>

      {/* Expiry Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Batch Expiry Details</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Loading expiry data...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-neutral-600">No expiry data available</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  Batch No
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  Product
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  SKU
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  Expiry Date
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  Days Left
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  Quantity
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  Warehouse
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className={`border-t border-neutral-200 hover:bg-neutral-50 ${
                    item.status === "Critical" ? "bg-red-50/30" : ""
                  }`}
                >
                  <td className="px-6 py-4">{item.batch}</td>
                  <td className="px-6 py-4">{item.product}</td>
                  <td className="px-6 py-4 text-neutral-600">{item.sku}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      {item.expiry}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        item.daysLeft <= 15
                          ? "text-red-600"
                          : item.daysLeft <= 60
                          ? "text-orange-600"
                          : ""
                      }
                    >
                      {item.daysLeft} days
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4 text-neutral-600">
                    {item.warehouse}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "Critical" && (
                      <button 
                        onClick={() => handleNotifyWarehouse(item.warehouse)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Mark for Clearance
                      </button>
                    )}
                    {item.status === "Expiring Soon" && (
                      <button 
                        onClick={() => handleNotifyWarehouse(item.warehouse)}
                        className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                      >
                        Prioritize Sale
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {filteredData.length} batches
          </div>
        </div>
      </div>
    </div>
  );
}
