import { useState } from 'react';
import { FileText, Check, X, Eye, Download, AlertTriangle, Sparkles, Settings, Zap } from 'lucide-react';

export default function CheckDocs() {
  const [documents, setDocuments] = useState([
    { id: 1, company: 'MedSupply Inc.', docType: 'Business License', uploadDate: '2024-11-15', expiryDate: '2025-11-15', status: 'Verified', fileType: 'PDF', autoValidation: { score: 96, issues: [] } },
    { id: 2, company: 'PharmaCorp', docType: 'Tax Certificate', uploadDate: '2024-10-20', expiryDate: '2025-10-20', status: 'Pending Review', fileType: 'PDF', autoValidation: { score: 92, issues: [] } },
    { id: 3, company: 'HealthDist Ltd.', docType: 'Pharmaceutical License', uploadDate: '2024-12-01', expiryDate: '2026-12-01', status: 'Pending Review', fileType: 'PDF', autoValidation: { score: 88, issues: ['Minor text blur'] } },
    { id: 4, company: 'MedSupply Inc.', docType: 'Insurance Certificate', uploadDate: '2024-09-10', expiryDate: '2025-09-10', status: 'Verified', fileType: 'PDF', autoValidation: { score: 98, issues: [] } },
    { id: 5, company: 'BioHealth Co.', docType: 'Quality Certification', uploadDate: '2024-08-15', expiryDate: '2024-12-15', status: 'Expiring Soon', fileType: 'PDF', autoValidation: { score: 75, issues: ['Expiring in 30 days'] } },
    { id: 6, company: 'PharmaCorp', docType: 'GMP Certificate', uploadDate: '2024-07-01', expiryDate: '2025-07-01', status: 'Verified', fileType: 'PDF', autoValidation: { score: 94, issues: [] } }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [autoVerifyThreshold, setAutoVerifyThreshold] = useState(85);
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);
  const [expiryAlertDays, setExpiryAlertDays] = useState(30);

  const handleVerify = (id: number) => {
    setDocuments(documents.map(d => 
      d.id === id ? { ...d, status: 'Verified' } : d
    ));
    alert('Document verified successfully');
  };

  const handleReject = (id: number) => {
    setSelectedDoc(id);
    setShowRejectModal(true);
  };

  const handleAutoVerify = () => {
    const updated = documents.map(d => {
      if (d.status === 'Pending Review' && d.autoValidation.score >= autoVerifyThreshold) {
        return { ...d, status: 'Auto-Verified' };
      }
      return d;
    });
    setDocuments(updated);
    const count = updated.filter(d => d.status === 'Auto-Verified').length;
    alert(`${count} document(s) auto-verified based on AI validation`);
  };

  const handleBulkExpiryCheck = () => {
    const today = new Date();
    const alertDate = new Date();
    alertDate.setDate(today.getDate() + expiryAlertDays);
    
    let expiringCount = 0;
    const updated = documents.map(d => {
      const expiry = new Date(d.expiryDate);
      if (expiry <= alertDate && expiry > today && d.status !== 'Expiring Soon') {
        expiringCount++;
        return { ...d, status: 'Expiring Soon' };
      }
      return d;
    });
    
    setDocuments(updated);
    alert(`Expiry check complete. ${expiringCount} documents flagged as expiring within ${expiryAlertDays} days.`);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    if (selectedDoc !== null) {
      setDocuments(documents.map(d => 
        d.id === selectedDoc ? { ...d, status: 'Rejected' } : d
      ));
      alert('Document rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedDoc(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
      case 'Auto-Verified':
        return 'bg-green-100 text-green-700';
      case 'Rejected': 
        return 'bg-red-100 text-red-700';
      case 'Expiring Soon': 
        return 'bg-orange-100 text-orange-700';
      default: 
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const pendingCount = documents.filter(d => d.status === 'Pending Review').length;
  const expiringCount = documents.filter(d => d.status === 'Expiring Soon').length;

  return (
    <div className="space-y-6">
      <div>
        <h1>Check Regulatory Docs - MedBiz</h1>
        <p className="text-neutral-600 mt-1">Verify supplier regulatory documentation and compliance with AI automation</p>
      </div>

      {/* Automation Control Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-blue-900">AI-Powered Document Automation</h3>
              <p className="text-sm text-blue-700 mt-1">
                Auto-verify regulatory documents and monitor expiry dates
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAutomationSettings(!showAutomationSettings)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        {showAutomationSettings && (
          <div className="space-y-4 mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <label className="text-sm text-blue-900">Enable Automation</label>
              <button
                onClick={() => setAutomationEnabled(!automationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  automationEnabled ? 'bg-blue-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    automationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="text-sm text-blue-900 block mb-2">
                Auto-Verification Threshold: {autoVerifyThreshold}%
              </label>
              <input
                type="range"
                min="75"
                max="99"
                value={autoVerifyThreshold}
                onChange={(e) => setAutoVerifyThreshold(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-blue-700 mt-1">
                <span>Moderate (75%)</span>
                <span>Strict (99%)</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-blue-900 block mb-2">
                Expiry Alert Window: {expiryAlertDays} days
              </label>
              <input
                type="range"
                min="15"
                max="90"
                value={expiryAlertDays}
                onChange={(e) => setExpiryAlertDays(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-blue-700 mt-1">
                <span>15 days</span>
                <span>90 days</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleAutoVerify}
            disabled={!automationEnabled}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Run Auto-Verification
          </button>
          <button
            onClick={handleBulkExpiryCheck}
            disabled={!automationEnabled}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Bulk Expiry Check
          </button>
          <div className="text-sm text-blue-700 flex items-center">
            {pendingCount} pending documents ready for verification
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">{pendingCount}</div>
          </div>
          <div className="text-sm text-neutral-600">Pending Review</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl">{documents.filter(d => d.status === 'Verified' || d.status === 'Auto-Verified').length}</div>
          </div>
          <div className="text-sm text-neutral-600">Verified</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl">{expiringCount}</div>
          </div>
          <div className="text-sm text-neutral-600">Expiring Soon</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="text-2xl">{documents.length}</div>
          </div>
          <div className="text-sm text-neutral-600">Total Documents</div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Regulatory Documents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Company</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Document Type</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Upload Date</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Expiry Date</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">File Type</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">AI Score</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">{doc.company}</td>
                  <td className="px-6 py-4">{doc.docType}</td>
                  <td className="px-6 py-4 text-neutral-600">{doc.uploadDate}</td>
                  <td className="px-6 py-4 text-neutral-600">{doc.expiryDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                      {doc.fileType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`${getScoreColor(doc.autoValidation.score)}`}>
                        {doc.autoValidation.score}%
                      </span>
                      {doc.autoValidation.issues.length > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          {doc.autoValidation.issues[0]}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {doc.status === 'Pending Review' && (
                        <>
                          <button
                            onClick={() => handleVerify(doc.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Verify"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(doc.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">Showing {documents.length} documents</div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-green-900 mb-2">AI-Powered Verification for MedBiz Suppliers</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Automated OCR extraction of document details and expiry dates</li>
              <li>✓ Cross-reference business licenses with regulatory databases</li>
              <li>✓ Verify pharmaceutical distribution credentials</li>
              <li>✓ Validate quality certifications (GMP, ISO, etc.)</li>
              <li>✓ Automated expiry tracking and renewal reminders</li>
              <li>✓ Fraud detection using document authenticity analysis</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg">Reject Document</h3>
                <p className="text-sm text-neutral-600">Specify reason for rejection</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="e.g., Document expired, illegible, missing signatures..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}