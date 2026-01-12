import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { productService, type Product } from '../../sevices/productService';

interface ProductDisplay {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  warehouse: string;
  warehouseId: string;
}

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function RemoveProduct() {
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | 'multiple' | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

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
        page: 0,
        size: 100
      });
      
      const mappedProducts: ProductDisplay[] = response.content.map((product) => ({
        id: product.skuId,
        name: product.productName,
        sku: product.skuId,
        category: product.category,
        stock: product.quantity || 0,
        warehouse: `Warehouse ${product.warehouseId}`,
        warehouseId: product.warehouseId
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    setItemToDelete(id);
    setShowModal(true);
  };

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) {
      setNotification({
        type: 'warning',
        message: 'Please select items to remove'
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    setItemToDelete('multiple');
    setShowModal(true);
  };

  const confirmRemove = async () => {
    try {
      if (itemToDelete === 'multiple') {
        // Delete multiple products
        const deletedCount = selectedIds.length;
        let successCount = 0;
        let failedProducts: string[] = [];
        
        for (const id of selectedIds) {
          try {
            const product = products.find(p => p.id === id);
            if (!product) continue;
            // Use the actual warehouse ID from the product, not the filter
            const productWarehouseId = product.warehouseId;
            await productService.delete(id, productWarehouseId);
            successCount++;
          } catch (error: any) {
            const product = products.find(p => p.id === id);
            const productName = product?.name || id;
            failedProducts.push(productName);
            console.error(`Failed to delete product ${id}:`, error);
          }
        }
        
        await loadProducts(); // Reload products
        setSelectedIds([]);
        
        if (failedProducts.length > 0) {
          setNotification({
            type: 'warning',
            message: `${successCount} product(s) removed successfully. Failed to remove: ${failedProducts.join(', ')}`
          });
        } else {
          setNotification({
            type: 'success',
            message: `${successCount} product(s) removed successfully`
          });
        }
        setTimeout(() => setNotification(null), 5000);
      } else if (itemToDelete !== null) {
        // Delete single product
        const product = products.find(p => p.id === itemToDelete);
        if (!product) return;
        // Use the actual warehouse ID from the product, not the filter
        const productWarehouseId = product.warehouseId;
        await productService.delete(itemToDelete, productWarehouseId);
        await loadProducts(); // Reload products
        setNotification({
          type: 'success',
          message: `${product?.name || itemToDelete} removed successfully`
        });
        setTimeout(() => setNotification(null), 4000);
      }
      setShowModal(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Error removing product:', error);
      // Extract error message from API response
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to remove product. Please try again.';
      setNotification({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setNotification(null), 5000);
      setShowModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Remove Product</h1>
        <p className="text-neutral-600 mt-1">Remove products from your inventory</p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`mb-6 rounded-lg border p-4 flex items-start justify-between ${
          notification.type === 'success' ? 'bg-green-50 border-green-200' :
          notification.type === 'error' ? 'bg-red-50 border-red-200' :
          notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3 flex-1">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
            {notification.type === 'info' && <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />}
            <p className={`text-sm flex-1 ${
              notification.type === 'success' ? 'text-green-800' :
              notification.type === 'error' ? 'text-red-800' :
              notification.type === 'warning' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`ml-4 ${
              notification.type === 'success' ? 'text-green-600 hover:text-green-700' :
              notification.type === 'error' ? 'text-red-600 hover:text-red-700' :
              notification.type === 'warning' ? 'text-yellow-600 hover:text-yellow-700' :
              'text-blue-600 hover:text-blue-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Warehouse Filter */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-neutral-700">Warehouse:</label>
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
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">Loading products...</div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <button 
            onClick={handleRemoveSelected}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            disabled={selectedIds.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Remove Selected
          </button>
          <div className="text-sm text-neutral-600">
            {selectedIds.length} items selected
          </div>
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
                          setSelectedIds(products.map(p => p.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      checked={selectedIds.length === products.length && products.length > 0}
                      className="w-4 h-4"
                      disabled={loading}
                    />
                </th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Product Name</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">SKU</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Category</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Stock</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Warehouse</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    No products to display
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t border-neutral-200 hover:bg-neutral-50">
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
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4 text-neutral-600">{product.sku}</td>
                    <td className="px-6 py-4 text-neutral-600">{product.category}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4 text-neutral-600">{product.warehouse}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">Showing {products.length} products</div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg">Confirm Removal</h3>
                <p className="text-sm text-neutral-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-neutral-700 mb-6">
              {itemToDelete === 'multiple' 
                ? `Are you sure you want to remove ${selectedIds.length} selected product(s)?`
                : 'Are you sure you want to remove this product from inventory?'
              }
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
