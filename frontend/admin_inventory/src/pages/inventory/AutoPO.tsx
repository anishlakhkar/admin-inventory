import { useState } from 'react';
import { Settings, Play, Pause, RefreshCw } from 'lucide-react';

export default function AutoPO() {
  const [autoPoEnabled, setAutoPoEnabled] = useState(true);
  const [thresholds, setThresholds] = useState({
    lowStock: 100,
    criticalStock: 50,
    reorderQuantity: 500
  });

  const suppliers = [
    { id: 1, name: 'MedSupply Inc.', contact: 'supplier1@medsupply.com', terms: 'Net 30' },
    { id: 2, name: 'PharmaCorp', contact: 'orders@pharmacorp.com', terms: 'Net 45' },
    { id: 3, name: 'HealthDist Ltd.', contact: 'sales@healthdist.com', terms: 'Net 30' }
  ];

  const autoPOQueue = [
    { id: 1, product: 'Aspirin 75mg', sku: 'MED-004', current: 45, threshold: 100, quantity: 500, supplier: 'MedSupply Inc.', status: 'Pending', priority: 'High' },
    { id: 2, product: 'Ibuprofen 200mg', sku: 'MED-002', current: 120, threshold: 200, quantity: 500, supplier: 'PharmaCorp', status: 'Pending', priority: 'Medium' },
    { id: 3, product: 'Vitamin D3 1000IU', sku: 'SUP-012', current: 78, threshold: 150, quantity: 500, supplier: 'HealthDist Ltd.', status: 'Generated', priority: 'Medium' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Auto Purchase Orders</h1>
        <p className="text-neutral-600 mt-1">Configure automatic PO generation for low stock items</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${autoPoEnabled ? 'bg-green-100' : 'bg-neutral-100'}`}>
              {autoPoEnabled ? (
                <Play className="w-6 h-6 text-green-600" />
              ) : (
                <Pause className="w-6 h-6 text-neutral-600" />
              )}
            </div>
            <div>
              <div className="text-lg">Auto PO Status</div>
              <div className={`text-sm ${autoPoEnabled ? 'text-green-600' : 'text-neutral-600'}`}>
                {autoPoEnabled ? 'Active - Monitoring stock levels' : 'Paused'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setAutoPoEnabled(!autoPoEnabled)}
            className={`px-6 py-2 rounded-lg transition-colors ${
              autoPoEnabled 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {autoPoEnabled ? 'Pause Auto PO' : 'Resume Auto PO'}
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2>Auto PO Settings</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm mb-2">Low Stock Threshold</label>
              <input
                type="number"
                value={thresholds.lowStock}
                onChange={(e) => setThresholds({ ...thresholds, lowStock: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-neutral-500 mt-1">Generate PO when stock falls below this level</p>
            </div>
            <div>
              <label className="block text-sm mb-2">Critical Stock Threshold</label>
              <input
                type="number"
                value={thresholds.criticalStock}
                onChange={(e) => setThresholds({ ...thresholds, criticalStock: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-neutral-500 mt-1">Priority PO generation threshold</p>
            </div>
            <div>
              <label className="block text-sm mb-2">Default Reorder Quantity</label>
              <input
                type="number"
                value={thresholds.reorderQuantity}
                onChange={(e) => setThresholds({ ...thresholds, reorderQuantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-neutral-500 mt-1">Default quantity for auto POs</p>
            </div>
          </div>

          <div className="mt-6">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Configuration */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Preferred Suppliers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Supplier Name</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Contact</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Payment Terms</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">{supplier.name}</td>
                  <td className="px-6 py-4 text-neutral-600">{supplier.contact}</td>
                  <td className="px-6 py-4 text-neutral-600">{supplier.terms}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto PO Queue */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h2>Auto PO Queue</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Generate Now
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Product</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">SKU</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Current Stock</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Order Qty</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Supplier</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Priority</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {autoPOQueue.map((item) => (
                <tr key={item.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">{item.product}</td>
                  <td className="px-6 py-4 text-neutral-600">{item.sku}</td>
                  <td className="px-6 py-4">{item.current}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4 text-neutral-600">{item.supplier}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'Generated' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
