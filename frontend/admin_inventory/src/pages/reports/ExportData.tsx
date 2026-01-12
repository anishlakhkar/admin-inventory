import { useState } from 'react';
import { Download, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { reportService, type ExportRequest } from '../../sevices/reportService';

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function ExportData() {
  const [exportConfig, setExportConfig] = useState<ExportRequest>({
    exportType: 'full-inventory',
    format: 'csv' as 'pdf' | 'xlsx' | 'csv',
    warehouseId: undefined
    // startDate and endDate are optional - backend will export all data if not provided
  });
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const dataTypes = [
    { value: 'full-inventory', label: 'Full Inventory Data', description: 'All products with stock levels' },
    { value: 'low-stock', label: 'Low Stock Items', description: 'Items below minimum threshold' },
    { value: 'expiry-data', label: 'Expiry Data', description: 'Batch expiry information' },
    { value: 'purchase-orders', label: 'Purchase Orders', description: 'PO history and status' }
  ];

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportConfig.exportType) {
      setNotification({
        type: 'warning',
        message: 'Please select data type to export'
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    try {
      setExporting(true);
      
      // Call export API (no date range - backend will export all data)
      const blob = await reportService.exportData(exportConfig);
      
      // Generate filename based on export type
      const exportTypeNames: Record<string, string> = {
        'full-inventory': 'Full_Inventory',
        'low-stock': 'Low_Stock',
        'expiry-data': 'Expiry_Data',
        'purchase-orders': 'Purchase_Orders'
      };
      
      const fileName = `${exportTypeNames[exportConfig.exportType]}_All_Data.${exportConfig.format}`;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setNotification({
        type: 'success',
        message: `Export downloaded successfully! File: ${fileName}`
      });
      setTimeout(() => setNotification(null), 5000);
      
      // Reset form
      setExportConfig({
        exportType: 'full-inventory',
        format: 'csv',
        warehouseId: undefined
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      
      // Handle blob error response
      let errorMessage = 'Error exporting data. Please try again.';
      if (error.response?.data) {
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const errorJson = JSON.parse(text);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = error.message || errorMessage;
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Export Data</h1>
        <p className="text-neutral-600 mt-1">Export inventory data in various formats</p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`rounded-lg border p-4 flex items-start justify-between ${
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

      {/* Quick Export */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            <h2>Quick Export</h2>
          </div>
        </div>

        <form onSubmit={handleExport} className="p-6">
          <div className="space-y-6">
            {/* Data Type Selection */}
            <div>
              <label className="block text-sm mb-3">Select Data to Export *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {dataTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportConfig.exportType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-300 hover:border-blue-300 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportType"
                      value={type.value}
                      checked={exportConfig.exportType === type.value}
                      onChange={(e) => setExportConfig({ ...exportConfig, exportType: e.target.value as any })}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs text-neutral-600 mt-1">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm mb-3">Export Format *</label>
              <div className="flex flex-wrap gap-3">
                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                  exportConfig.format === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:bg-neutral-50'
                }`}>
                  <input
                    type="radio"
                    name="exportFormat"
                    value="pdf"
                    checked={exportConfig.format === 'pdf'}
                    onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value as any })}
                  />
                  <span className="text-sm">PDF</span>
                </label>

                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                  exportConfig.format === 'xlsx' ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:bg-neutral-50'
                }`}>
                  <input
                    type="radio"
                    name="exportFormat"
                    value="xlsx"
                    checked={exportConfig.format === 'xlsx'}
                    onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value as any })}
                  />
                  <span className="text-sm">Excel (XLSX)</span>
                </label>

                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                  exportConfig.format === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:bg-neutral-50'
                }`}>
                  <input
                    type="radio"
                    name="exportFormat"
                    value="csv"
                    checked={exportConfig.format === 'csv'}
                    onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value as any })}
                  />
                  <span className="text-sm">CSV</span>
                </label>
              </div>
            </div>

            {/* Note about all data */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This export will include all available data regardless of date range.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <button
                type="submit"
                disabled={exporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export Now'}
              </button>
              <button
                type="button"
                onClick={() => setExportConfig({
                  exportType: 'full-inventory',
                  format: 'csv',
                  warehouseId: undefined
                })}
                className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
