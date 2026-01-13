import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Calendar, Edit2, Check, X, Upload, Eye, Package } from 'lucide-react';
import { productService, type Product as BackendProduct } from '../../sevices/productService';
import { stockService } from '../../sevices/stockService';

interface ProductDisplay {
  id: string;
  name: string;
  sku: string;
  category: string;
  warehouse: string;
  warehouseId: string;
  current: number;
  new: number;
  price: number;
  status: string;
  minStock: number;
}

export default function ProductInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'view' | 'update' | 'bulkUpdate'>('view');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<ProductDisplay[]>([]);

  // Fetch products from API
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll({
        warehouseId: warehouseFilter,
        search: searchTerm || undefined,
        page: 0,
        size: 100
      });
      
      // Map backend products to display format
      const mappedProducts: ProductDisplay[] = response.content.map((product, index) => {
        const status = product.quantity === 0 ? 'Out of Stock' :
                      product.quantity < product.thresholdQuantity ? 'Low Stock' :
                      product.quantity < product.thresholdQuantity * 0.5 ? 'Critical' : 'In Stock';
        
        return {
          id: product.skuId,
          name: product.productName,
          sku: product.skuId,
          category: product.category,
          warehouse: `Warehouse ${product.warehouseId}`,
          warehouseId: product.warehouseId,
          current: product.quantity,
          new: product.quantity,
          price: typeof product.price === 'number' ? product.price : (typeof product.price === 'string' ? parseFloat(product.price) : 0),
          status: status,
          minStock: product.thresholdQuantity
        };
      });
      
      setStockData(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const lowStockAlerts = stockData.filter(p => p.current < p.minStock);

  const expiryData: Array<{ batch: string; product: string; expiry: string; quantity: number; status: string }> = [];

  const filteredProducts = stockData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesWarehouse = warehouseFilter === 'all' || p.warehouseId === warehouseFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = async (id: string) => {
    const item = stockData.find(s => s.id === id);
    if (item) {
      try {
        // Use the actual warehouse ID from the product, not the filter
        const productWarehouseId = item.warehouseId;
        // Update stock via API
        await stockService.update(id, productWarehouseId, {
          warehouseId: productWarehouseId,
          skuId: id,
          quantity: item.new
        });
        
        setStockData(stockData.map(s => 
          s.id === id ? { ...s, current: s.new } : s
        ));
        setEditingId(null);
        alert(`Stock updated for ${item.name}`);
      } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please try again.');
      }
    }
  };

  const handleCancel = (id: string) => {
    setStockData(stockData.map(s => 
      s.id === id ? { ...s, new: s.current } : s
    ));
    setEditingId(null);
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) {
      alert('Please select items to update');
      return;
    }
    try {
      for (const id of selectedIds) {
        const item = stockData.find(s => s.id === id);
        if (item) {
          // Use the actual warehouse ID from the product, not the filter
          const productWarehouseId = item.warehouseId;
          await stockService.update(id, productWarehouseId, {
            warehouseId: productWarehouseId,
            skuId: id,
            quantity: item.new
          });
        }
      }
      alert(`Bulk updated ${selectedIds.length} items successfully`);
      loadProducts(); // Reload data
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk updating:', error);
      alert('Failed to bulk update. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Product Inventory</h1>
        <p className="text-neutral-600 mt-1">View, search, and update your product inventory</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">Loading products...</div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">{stockData.length}</div>
          </div>
          <div className="text-sm text-neutral-600">Total Products</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl">{stockData.filter(p => p.status === 'In Stock').length}</div>
          </div>
          <div className="text-sm text-neutral-600">In Stock</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl">{lowStockAlerts.length}</div>
          </div>
          <div className="text-sm text-neutral-600">Low Stock</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl">${stockData.reduce((sum, p) => sum + (p.current * p.price), 0).toLocaleString()}</div>
          </div>
          <div className="text-sm text-neutral-600">Total Value</div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-1 w-fit">
        <button
          onClick={() => setViewMode('view')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === 'view' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <Eye className="w-4 h-4" />
          View Mode
        </button>
        {/* <button
          onClick={() => setViewMode('update')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === 'update' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          Update Mode
        </button> */}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
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
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">{viewMode === 'view' ? 'All Products' : 'Update Stock'}</h2>
          {viewMode === 'update' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Bulk Update Selected
              </button>
              <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <div className="text-sm text-neutral-600">
                {selectedIds.length} items selected
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                {viewMode === 'update' && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredProducts.map(s => s.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      className="w-4 h-4"
                    />
                  </th>
                )}
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Product Name</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">SKU</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Category</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Warehouse</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Current Stock</th>
                {viewMode === 'update' && (
                  <th className="text-left px-6 py-3 text-sm text-neutral-600">New Stock</th>
                )}
                {viewMode === 'view' && (
                  <th className="text-left px-6 py-3 text-sm text-neutral-600">Price</th>
                )}
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
                {viewMode === 'update' && (
                  <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  {viewMode === 'update' && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, product.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== product.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4 text-neutral-600">{product.sku}</td>
                  <td className="px-6 py-4 text-neutral-600">{product.category}</td>
                  <td className="px-6 py-4 text-neutral-600">{product.warehouse}</td>
                  <td className="px-6 py-4">{product.current}</td>
                  {viewMode === 'update' && (
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={product.new}
                          onChange={(e) => {
                            setStockData(stockData.map(s => 
                              s.id === product.id ? { ...s, new: parseInt(e.target.value) || 0 } : s
                            ));
                          }}
                          className="w-24 px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span>{product.new}</span>
                      )}
                    </td>
                  )}
                  {viewMode === 'view' && (
                    <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'In Stock' ? 'bg-green-100 text-green-700' :
                      product.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  {viewMode === 'update' && (
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSave(product.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(product.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {filteredProducts.length} of {stockData.length} products
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h2>Low Stock Alerts</h2>
          </div>
          <div className="p-6 space-y-3">
            {lowStockAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <div>{alert.name}</div>
                    <div className="text-sm text-neutral-600">
                      Current: {alert.current} | Threshold: {alert.minStock} | {alert.warehouse}
                    </div>
                  </div>
                </div>
                {/* <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Reorder
                </button> */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiry Tracking */}
      {/* <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Expiry Tracking</h2>
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
              {expiryData.map((item, idx) => (
                <tr key={idx} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">{item.batch}</td>
                  <td className="px-6 py-4">{item.product}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    {item.expiry}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'Expiring Soon' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
}
