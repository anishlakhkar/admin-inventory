import { useState } from 'react';
import { Edit2, Check, X, Plus, CreditCard } from 'lucide-react';

export default function PaymentTerms() {
  const [terms, setTerms] = useState([
    { id: 1, name: 'Net 30', description: 'Payment due within 30 days', discount: 0, active: true },
    { id: 2, name: 'Net 45', description: 'Payment due within 45 days', discount: 0, active: true },
    { id: 3, name: 'Net 60', description: 'Payment due within 60 days', discount: 0, active: true },
    { id: 4, name: '2/10 Net 30', description: '2% discount if paid within 10 days, otherwise due in 30 days', discount: 2, active: true },
    { id: 5, name: 'Due on Receipt', description: 'Payment due immediately upon receipt', discount: 0, active: true },
    { id: 6, name: 'Net 90', description: 'Payment due within 90 days', discount: 0, active: false }
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', description: '', discount: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTerm, setNewTerm] = useState({ name: '', description: '', discount: 0 });

  const handleEdit = (term: typeof terms[0]) => {
    setEditingId(term.id);
    setEditData({ name: term.name, description: term.description, discount: term.discount });
  };

  const handleSave = (id: number) => {
    setTerms(terms.map(t => 
      t.id === id ? { ...t, ...editData } : t
    ));
    setEditingId(null);
    alert('Payment term updated successfully');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({ name: '', description: '', discount: 0 });
  };

  const handleToggleActive = (id: number) => {
    setTerms(terms.map(t => 
      t.id === id ? { ...t, active: !t.active } : t
    ));
  };

  const handleAddNew = () => {
    if (!newTerm.name.trim() || !newTerm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newId = Math.max(...terms.map(t => t.id), 0) + 1;
    setTerms([...terms, { id: newId, ...newTerm, active: true }]);
    setNewTerm({ name: '', description: '', discount: 0 });
    setShowAddModal(false);
    alert('Payment term added successfully');
  };

  const supplierTerms = [
    { supplier: 'MedSupply Inc.', term: 'Net 30', orders: 45, avgAmount: 12500 },
    { supplier: 'PharmaCorp', term: 'Net 45', orders: 32, avgAmount: 18900 },
    { supplier: 'HealthDist Ltd.', term: '2/10 Net 30', orders: 28, avgAmount: 9800 },
    { supplier: 'BioHealth Co.', term: 'Net 60', orders: 15, avgAmount: 25400 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Payment Terms Management</h1>
        <p className="text-neutral-600 mt-1">Configure and manage payment terms for suppliers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">{terms.filter(t => t.active).length}</div>
          </div>
          <div className="text-sm text-neutral-600">Active Payment Terms</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl">{terms.filter(t => t.discount > 0).length}</div>
          </div>
          <div className="text-sm text-neutral-600">Terms with Discount</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl">{supplierTerms.length}</div>
          </div>
          <div className="text-sm text-neutral-600">Suppliers Configured</div>
        </div>
      </div>

      {/* Payment Terms List */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h2>Payment Terms</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Term
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Term Name</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Description</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Discount %</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term) => (
                <tr key={term.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    {editingId === term.id ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      term.name
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === term.id ? (
                      <input
                        type="text"
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="w-full px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-neutral-600">{term.description}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === term.id ? (
                      <input
                        type="number"
                        value={editData.discount}
                        onChange={(e) => setEditData({ ...editData, discount: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.1"
                        min="0"
                      />
                    ) : (
                      <span>{term.discount}%</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(term.id)}
                      className={`px-2 py-1 rounded-full text-xs ${
                        term.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {term.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === term.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(term.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(term)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Payment Terms */}
      {/* <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Supplier Payment Terms</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Supplier</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Current Terms</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Total Orders</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Avg Order Amount</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplierTerms.map((item, idx) => (
                <tr key={idx} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">{item.supplier}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {item.term}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{item.orders}</td>
                  <td className="px-6 py-4 text-neutral-600">${item.avgAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-sm">
                      Change Terms
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Add New Term Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg">Add New Payment Term</h3>
                <p className="text-sm text-neutral-600">Create a custom payment term</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm mb-2">Term Name *</label>
                <input
                  type="text"
                  value={newTerm.name}
                  onChange={(e) => setNewTerm({ ...newTerm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Net 15"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Description *</label>
                <textarea
                  value={newTerm.description}
                  onChange={(e) => setNewTerm({ ...newTerm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the payment terms..."
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Early Payment Discount (%)</label>
                <input
                  type="number"
                  value={newTerm.discount}
                  onChange={(e) => setNewTerm({ ...newTerm, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTerm({ name: '', description: '', discount: 0 });
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Term
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
