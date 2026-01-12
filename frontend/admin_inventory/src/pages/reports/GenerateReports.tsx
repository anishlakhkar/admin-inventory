import { useState, useEffect } from 'react';
import { FileBarChart, Download, Calendar, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { reportService, type RecentReportResponse, type PurchaseOrderReportResponse } from '../../sevices/reportService';
import api from '../../sevices/api';

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function GenerateReports() {
  const [reportConfig, setReportConfig] = useState({
    type: '',
    startDate: '',
    endDate: '',
    format: 'pdf' as 'pdf' | 'xlsx' | 'csv'
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<RecentReportResponse[]>([]);
  const [generatedReports, setGeneratedReports] = useState<Map<number, any>>(new Map());
  const [reportIdCounter, setReportIdCounter] = useState(1);
  const [notification, setNotification] = useState<Notification | null>(null);

  const reportTypes = [
    { value: 'inventory-valuation', label: 'Inventory Valuation Report', description: 'Current stock value by warehouse' },
    { value: 'low-stock', label: 'Low Stock Report', description: 'Items below minimum threshold' },
    { value: 'purchase-order', label: 'Purchase Order Summary', description: 'PO history and status' }
  ];

  // Load recent reports on mount
  useEffect(() => {
    loadRecentReports();
  }, []);

  const loadRecentReports = async () => {
    try {
      setLoading(true);
      const reports = await reportService.getRecentReports();
      // Only show reports that exist (from backend or locally generated)
      setRecentReports(reports);
    } catch (error) {
      console.error('Error loading recent reports:', error);
      setRecentReports([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePurchaseOrderReport = async (startDate: string, endDate: string, format: string): Promise<PurchaseOrderReportResponse> => {
    // Fetch all purchase orders from backend API
    // Backend returns List<PurchaseOrderResponse> directly (not paginated)
    const response = await api.get('/purchase-orders');
    const allPurchaseOrders = response.data || [];
    
    // Filter purchase orders by date range
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    const filteredOrders = allPurchaseOrders.filter((po: any) => {
      if (!po.createdAt) return false;
      const poDate = new Date(po.createdAt);
      return poDate >= start && poDate <= end;
    });
    
    // Calculate summary statistics
    const totalAmount = filteredOrders.reduce((sum: number, po: any) => {
      const amount = typeof po.totalAmount === 'number' ? po.totalAmount : parseFloat(po.totalAmount || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Group by status
    const statusMap = new Map<string, { count: number; totalAmount: number }>();
    filteredOrders.forEach((po: any) => {
      const status = po.status || 'UNKNOWN';
      const current = statusMap.get(status) || { count: 0, totalAmount: 0 };
      const amount = typeof po.totalAmount === 'number' ? po.totalAmount : parseFloat(po.totalAmount || '0');
      statusMap.set(status, {
        count: current.count + 1,
        totalAmount: current.totalAmount + (isNaN(amount) ? 0 : amount)
      });
    });
    
    const statusSummary = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      totalAmount: data.totalAmount.toFixed(2)
    }));
    
    // Create purchase order summaries
    const purchaseOrders = filteredOrders.map((po: any) => ({
      poId: po.poId || 0,
      poNumber: po.poNumber || 'N/A',
      orderId: po.orderId || 0,
      status: po.status || 'UNKNOWN',
      totalAmount: (typeof po.totalAmount === 'number' ? po.totalAmount : parseFloat(po.totalAmount || '0')).toFixed(2),
      createdAt: po.createdAt || '',
      approvedRejectedAt: po.approvedRejectedAt || '',
      approvedRejectedBy: po.approvedRejectedBy ? 
        (po.approvedRejectedBy.firstName && po.approvedRejectedBy.lastName ? 
          `${po.approvedRejectedBy.firstName} ${po.approvedRejectedBy.lastName}` : 
          po.approvedRejectedBy.email) : 
        undefined
    }));
    
    return {
      reportName: `Purchase Order Summary Report - ${startDate} to ${endDate}`,
      generatedDate: new Date().toISOString().split('T')[0],
      startDate,
      endDate,
      format: format.toUpperCase(),
      totalPurchaseOrders: filteredOrders.length,
      totalAmount: totalAmount.toFixed(2),
      statusSummary,
      purchaseOrders
    };
  };

  const downloadReportFile = async (request: any) => {
    try {
      // Handle purchase order reports - use backend export endpoint
      if (request.reportType === 'purchase-order') {
        // Use the backend export endpoint which properly generates PDF/XLSX/CSV
        const exportRequest = {
          exportType: 'purchase-orders',
          startDate: request.startDate,
          endDate: request.endDate,
          format: request.format
        };
        
        const response = await api.post('/reports/export', exportRequest, {
          responseType: 'blob'
        });

        const blob = response.data as Blob;
        const fileName = getFileName(request);
        
        // Download file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Store in recent reports
        const newReport: RecentReportResponse = {
          id: reportIdCounter,
          reportName: `Purchase Order Summary Report - ${request.startDate} to ${request.endDate}`,
          reportType: 'Purchase Order Summary',
          generatedDate: new Date().toISOString().split('T')[0],
          format: request.format.toUpperCase(),
          size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
          downloadUrl: ''
        };

        setRecentReports(prev => [newReport, ...prev].slice(0, 10));
        setReportIdCounter(prev => prev + 1);

        setNotification({
          type: 'success',
          message: `Report downloaded successfully! File: ${fileName}`
        });
        setTimeout(() => setNotification(null), 5000);
        
        // Reset form
        setReportConfig({ type: '', startDate: '', endDate: '', format: 'pdf' });
        return;
      }
      
      // Handle other report types via backend
      const response = await api.post('/reports/generate', request, {
        responseType: 'blob'
      });

      // Get file content (axios automatically converts blob response)
      const blob = response.data as Blob;
      const fileName = getFileName(request);
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Store in recent reports
      const newReport: RecentReportResponse = {
        id: reportIdCounter,
        reportName: `${request.reportType === 'inventory-valuation' ? 'Inventory Valuation' : 'Low Stock'} Report - ${request.startDate} to ${request.endDate}`,
        reportType: request.reportType === 'inventory-valuation' ? 'Inventory Valuation' : 'Low Stock',
        generatedDate: new Date().toISOString().split('T')[0],
        format: request.format.toUpperCase(),
        size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
        downloadUrl: ''
      };

      setRecentReports(prev => [newReport, ...prev].slice(0, 10));
      setReportIdCounter(prev => prev + 1);

      setNotification({
        type: 'success',
        message: `Report downloaded successfully! File: ${fileName}`
      });
      setTimeout(() => setNotification(null), 5000);
      
      // Reset form
      setReportConfig({ type: '', startDate: '', endDate: '', format: 'pdf' });
    } catch (error: any) {
      console.error('Error downloading report:', error);
      
      // Handle blob error response (when axios gets error with responseType: 'blob')
      let errorMessage = error.message || 'Error downloading report. Please try again.';
      if (error.response?.data) {
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const errorJson = JSON.parse(text);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            // If parsing fails, use default message
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      // Re-throw error so handleGenerate can catch it and handle setGenerating(false)
      throw new Error(errorMessage);
    }
  };

  const getFileName = (request: any): string => {
    let reportType = 'Report';
    if (request.reportType === 'inventory-valuation') {
      reportType = 'Inventory_Valuation';
    } else if (request.reportType === 'low-stock') {
      reportType = 'Low_Stock';
    } else if (request.reportType === 'purchase-order') {
      reportType = 'Purchase_Order_Summary';
    }
    const extension = request.format.toLowerCase();
    return `${reportType}_${request.startDate}_to_${request.endDate}.${extension}`;
  };

  const storeGeneratedReport = (response: any, reportType: string) => {
    // Store the generated report (for JSON format)
    const reportId = reportIdCounter;
    let reportTypeLabel = 'Report';
    if (reportType === 'inventory-valuation') {
      reportTypeLabel = 'Inventory Valuation';
    } else if (reportType === 'low-stock') {
      reportTypeLabel = 'Low Stock';
    } else if (reportType === 'purchase-order') {
      reportTypeLabel = 'Purchase Order Summary';
    }
    
    const newReport: RecentReportResponse = {
      id: reportId,
      reportName: response.reportName,
      reportType: reportTypeLabel,
      generatedDate: new Date().toISOString().split('T')[0],
      format: response.format,
      size: calculateReportSize(response),
      downloadUrl: `/api/reports/download/${reportId}`
    };
    
    // Store report data for download
    setGeneratedReports(prev => {
      const newMap = new Map(prev);
      newMap.set(reportId, { data: response, report: newReport });
      return newMap;
    });
    
    // Add to recent reports
    setRecentReports(prev => [newReport, ...prev].slice(0, 10));
    setReportIdCounter(prev => prev + 1);
    
    // Show success message
    setNotification({
      type: 'success',
      message: `Report generated successfully! Report: ${newReport.reportName} (${newReport.format}). You can download it from Recent Reports.`
    });
    setTimeout(() => setNotification(null), 5000);
    
    // Reset form
    setReportConfig({ type: '', startDate: '', endDate: '', format: 'pdf' });
  };

  const calculateReportSize = (reportData: any): string => {
    // Estimate file size based on data
    const jsonString = JSON.stringify(reportData);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(1);
    return `${sizeInMB} MB`;
  };

  const handleDownload = async (reportId: number) => {
    const reportData = generatedReports.get(reportId);
    
    if (!reportData) {
      setNotification({
        type: 'warning',
        message: 'Report data not found. Please regenerate the report.'
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    const { data, report } = reportData;
    
    // Determine report type
    let reportType = 'inventory-valuation';
    if (report.reportType === 'Inventory Valuation') {
      reportType = 'inventory-valuation';
    } else if (report.reportType === 'Low Stock') {
      reportType = 'low-stock';
    } else if (report.reportType === 'Purchase Order Summary') {
      reportType = 'purchase-order';
    }
    
    const format = report.format.toLowerCase();
    
    if (format === 'json' || !['pdf', 'xlsx', 'csv'].includes(format)) {
      // Download as JSON
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.reportName.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Regenerate and download as file
      try {
        const request = {
          reportType: reportType,
          startDate: (data as any).startDate || new Date().toISOString().split('T')[0],
          endDate: (data as any).endDate || new Date().toISOString().split('T')[0],
          format: format
        };
        await downloadReportFile(request);
      } catch (error: any) {
        setNotification({
          type: 'error',
          message: 'Error downloading report: ' + error.message
        });
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportConfig.type) {
      setNotification({
        type: 'warning',
        message: 'Please select a report type'
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    if (!reportConfig.startDate || !reportConfig.endDate) {
      setNotification({
        type: 'warning',
        message: 'Please select both start and end dates'
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    try {
      setGenerating(true);
      
      const request = {
        reportType: reportConfig.type as 'inventory-valuation' | 'low-stock' | 'purchase-order',
        startDate: reportConfig.startDate,
        endDate: reportConfig.endDate,
        format: reportConfig.format
      };

      // Handle purchase order reports
      if (reportConfig.type === 'purchase-order') {
        // Check if format is file type (PDF/XLSX/CSV) - download directly
        if (['pdf', 'xlsx', 'csv'].includes(reportConfig.format)) {
          await downloadReportFile(request);
        } else {
          // JSON format - get data and store
          const reportData = await generatePurchaseOrderReport(reportConfig.startDate, reportConfig.endDate, reportConfig.format);
          storeGeneratedReport(reportData, reportConfig.type);
        }
        return;
      }

      // Handle other report types
      // Check if format is file type (PDF/XLSX/CSV) - download directly
      if (['pdf', 'xlsx', 'csv'].includes(reportConfig.format)) {
        await downloadReportFile(request);
      } else {
        // JSON format - get data and store
        const response = await reportService.generateReport(request);
        storeGeneratedReport(response, reportConfig.type);
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Error generating report. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Reports & Analytics</h1>
        <p className="text-neutral-600 mt-1">Generate custom reports for inventory analysis</p>
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

      {/* Generate Reports Section */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            <h2>Generate Reports</h2>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="p-6">
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm mb-3">Select Report Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {reportTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      reportConfig.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-300 hover:border-blue-300 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={reportConfig.type === type.value}
                      onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-sm">{type.label}</div>
                      <div className="text-xs text-neutral-600 mt-1">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm mb-3">Date Range *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-600 mb-2">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="date"
                      value={reportConfig.startDate}
                      onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-2">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="date"
                      value={reportConfig.endDate}
                      onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Output Format */}
            <div>
              <label className="block text-sm mb-3">Output Format *</label>
              <div className="flex flex-wrap gap-3">
                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                  reportConfig.format === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:bg-neutral-50'
                }`}>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={reportConfig.format === 'pdf'}
                    onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value as 'pdf' | 'xlsx' | 'csv' })}
                  />
                  <span className="text-sm">PDF</span>
                </label>

                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                  reportConfig.format === 'xlsx' ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:bg-neutral-50'
                }`}>
                  <input
                    type="radio"
                    name="format"
                    value="xlsx"
                    checked={reportConfig.format === 'xlsx'}
                    onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value as 'pdf' | 'xlsx' | 'csv' })}
                  />
                  <span className="text-sm">Excel (XLSX)</span>
                </label>

                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                  reportConfig.format === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:bg-neutral-50'
                }`}>
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={reportConfig.format === 'csv'}
                    onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value as 'pdf' | 'xlsx' | 'csv' })}
                  />
                  <span className="text-sm">CSV</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <button
                type="submit"
                disabled={generating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileBarChart className="w-4 h-4" />
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                type="button"
                onClick={() => setReportConfig({ type: '', startDate: '', endDate: '', format: 'pdf' })}
                className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Recent Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Report Name</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Type</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Generated On</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Format</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Size</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-600">
                    Loading recent reports...
                  </td>
                </tr>
              ) : recentReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-600">
                    No recent reports found
                  </td>
                </tr>
              ) : (
                recentReports.map((report) => (
                <tr key={report.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="px-6 py-4">{report.reportName}</td>
                    <td className="px-6 py-4 text-neutral-600">{report.reportType}</td>
                    <td className="px-6 py-4 text-neutral-600">{report.generatedDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                      {report.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{report.size}</td>
                  <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDownload(report.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
