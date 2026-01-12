import { useState, useEffect } from 'react';
import { Search, Package, User, Building2 } from 'lucide-react';
import { productService } from '../../sevices/productService';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  catalogType: 'MedBuddy' | 'MedBiz' | 'Both';
  personaType: 'B2B' | 'B2C' | 'BOTH';
  lastUpdated: string;
}

export default function CatalogManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCatalogType, setSelectedCatalogType] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('001');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products from API
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouse]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll({
        warehouseId: selectedWarehouse,
        search: searchQuery || undefined,
        page: 0,
        size: 100
      });
      
      // Map backend products to display format
      const mappedProducts: Product[] = response.content.map((product) => {
        // Map backend personaType (B2B/B2C/BOTH) to display format (MedBiz/MedBuddy/Both)
        const personaTypeMap: Record<string, 'MedBuddy' | 'MedBiz' | 'Both'> = {
          'B2B': 'MedBiz',
          'B2C': 'MedBuddy',
          'BOTH': 'Both'
        };
        
        const personaType = product.personaType || 'BOTH';
        const catalogType = personaTypeMap[personaType] || 'Both';
        
        return {
          id: product.skuId,
          sku: product.skuId,
          name: product.productName,
          category: product.category,
          price: typeof product.price === 'number' ? product.price : (typeof product.price === 'string' ? parseFloat(product.price) : 0),
          stock: product.quantity || 0,
          status: product.quantity > 0 ? 'active' : 'inactive',
          catalogType: catalogType,
          personaType: personaType as 'B2B' | 'B2C' | 'BOTH',
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      });
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload when search changes (with debounce would be better, but simple for now)
  useEffect(() => {
    if (searchQuery !== '') {
      const timer = setTimeout(() => {
        loadProducts();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    const matchesCatalogType = selectedCatalogType === 'all' || product.catalogType === selectedCatalogType;
    return matchesSearch && matchesCategory && matchesStatus && matchesCatalogType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700';
      case 'discontinued':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const handlePersonaTypeChange = async (skuId: string, newPersonaType: 'B2B' | 'B2C' | 'BOTH') => {
    try {
      // Update in backend
      await productService.updatePersonaType(skuId, selectedWarehouse, newPersonaType);
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => {
          if (product.sku === skuId) {
            const personaTypeMap: Record<string, 'MedBuddy' | 'MedBiz' | 'Both'> = {
              'B2B': 'MedBiz',
              'B2C': 'MedBuddy',
              'BOTH': 'Both'
            };
            return {
              ...product,
              personaType: newPersonaType,
              catalogType: personaTypeMap[newPersonaType] || 'Both'
            };
          }
          return product;
        })
      );
    } catch (error) {
      console.error('Error updating persona type:', error);
      alert('Failed to update persona type. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Catalog Management</h1>
        <p className="text-neutral-600 mt-1">Manage your product catalog, pricing, and availability</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">Loading products...</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Products</p>
              <p className="text-2xl mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">MedBuddy</p>
              <p className="text-2xl mt-1">{products.filter(p => p.catalogType === 'MedBuddy' || p.catalogType === 'Both').length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">MedBiz</p>
              <p className="text-2xl mt-1">{products.filter(p => p.catalogType === 'MedBiz' || p.catalogType === 'Both').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active</p>
              <p className="text-2xl mt-1">{products.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Inactive</p>
              <p className="text-2xl mt-1">{products.filter(p => p.status === 'inactive').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Value</p>
              <p className="text-2xl mt-1">${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name or SKU..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="MEDICATIONS">Medications</option>
              <option value="SUPPLEMENTS">Supplements</option>
              <option value="EQUIPMENTS">Equipments</option>
              <option value="SUPPLIES">Supplies</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          {/* Catalog Type Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedCatalogType}
              onChange={(e) => setSelectedCatalogType(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Catalog Types</option>
              <option value="MedBuddy">MedBuddy</option>
              <option value="MedBiz">MedBiz</option>
              <option value="Both">Both</option>
            </select>
          </div>

        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">SKU</th>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">Product Name</th>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">Category</th>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">Catalog Type</th>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">Price</th>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">Stock</th>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">Status</th>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm">{product.sku}</td>
                    <td className="px-6 py-4 text-sm">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        product.catalogType === 'MedBuddy' ? 'bg-purple-100 text-purple-700' :
                        product.catalogType === 'MedBiz' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {product.catalogType === 'MedBuddy' && <User className="w-3 h-3" />}
                        {product.catalogType === 'MedBiz' && <Building2 className="w-3 h-3" />}
                        {product.catalogType === 'Both' && <Package className="w-3 h-3" />}
                        {product.catalogType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={product.stock === 0 ? 'text-red-600' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${getStatusColor(product.status)}`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{product.lastUpdated}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={product.personaType}
                        onChange={(e) => handlePersonaTypeChange(product.sku, e.target.value as 'B2B' | 'B2C' | 'BOTH')}
                        className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="B2B">MedBiz (B2B)</option>
                        <option value="B2C">MedBuddy (B2C)</option>
                        <option value="BOTH">Both</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                    No products found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Product Count */}
        <div className="border-t border-neutral-200 px-6 py-4">
          <p className="text-sm text-neutral-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>
    </div>
  );
}