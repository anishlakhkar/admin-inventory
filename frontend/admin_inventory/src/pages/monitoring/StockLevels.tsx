import { useState, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';
import { monitoringService, type StockLevelResponse } from '../../sevices/monitoringService';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  min: number;
  max: number;
  warehouse: string;
  status: string;
}

export default function StockLevels() {
  const [filters, setFilters] = useState({
    warehouse: 'all',
    category: 'all',
    status: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<StockItem[]>([]);

  // Fetch stock levels from API
  useEffect(() => {
    loadStockLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.warehouse, filters.category, filters.status]);

  const loadStockLevels = async () => {
    try {
      setLoading(true);
      const warehouseId = filters.warehouse;
      const category = filters.category === 'all' ? undefined : filters.category;
      const status = filters.status === 'all' ? undefined : filters.status;
      
      const response = await monitoringService.getStockLevels(warehouseId, category, status);
      
      // Map backend response to display format
      const mappedData: StockItem[] = response.map((item) => ({
        id: item.skuId,
        name: item.productName,
        sku: item.skuId,
        category: item.category,
        stock: item.stock,
        min: item.minStock,
        max: item.maxStock,
        warehouse: item.warehouse,
        status: item.status
      }));
      
      setStockData(mappedData);
    } catch (error) {
      console.error('Error loading stock levels:', error);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = stockData; // Already filtered by API

  return (
    <div className="space-y-6">
      <div>
        <h1>View Stock Levels</h1>
        <p className="text-neutral-600 mt-1">Monitor current stock levels across all warehouses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="text-2xl mb-1">{stockData.length}</div>
          <div className="text-sm text-neutral-600">Total SKUs</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="text-2xl mb-1 text-green-600">{stockData.filter(s => s.status === 'Optimal').length}</div>
          <div className="text-sm text-neutral-600">Optimal Stock</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="text-2xl mb-1 text-orange-600">{stockData.filter(s => s.status === 'Below Min').length}</div>
          <div className="text-sm text-neutral-600">Below Minimum</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="text-2xl mb-1 text-red-600">{stockData.filter(s => s.status === 'Critical').length}</div>
          <div className="text-sm text-neutral-600">Critical</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-600" />
              <h2>Filters</h2>
            </div>
            {/* <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button> */}
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <select
              value={filters.warehouse}
              onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Warehouses</option>
              <option value="001">Warehouse 001</option>
              <option value="002">Warehouse 002</option>
              <option value="003">Warehouse 003</option>
              <option value="004">Warehouse 004</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="MEDICATIONS">Medications</option>
              <option value="SUPPLEMENTS">Supplements</option>
              <option value="EQUIPMENTS">Equipments</option>
              <option value="SUPPLIES">Supplies</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Optimal">Optimal</option>
              <option value="Below Min">Below Min</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Stock Levels Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-neutral-600">Loading stock levels...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center text-neutral-600">No stock data available</div>
          ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Product Name</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">SKU</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Category</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Current Stock</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Min / Max</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Warehouse</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4 text-neutral-600">{item.sku}</td>
                  <td className="px-6 py-4 text-neutral-600">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>{item.stock}</span>
                      <div className="flex-1 max-w-[100px] h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.status === 'Critical' ? 'bg-red-500' :
                            item.status === 'Below Min' ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((item.stock / item.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{item.min} / {item.max}</td>
                  <td className="px-6 py-4 text-neutral-600">{item.warehouse}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'Optimal' ? 'bg-green-100 text-green-700' :
                      item.status === 'Below Min' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">Showing {filteredData.length} items</div>
        </div>
      </div>
    </div>
  );
}
