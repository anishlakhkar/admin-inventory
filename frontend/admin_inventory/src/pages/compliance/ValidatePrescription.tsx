import { AlertCircle, Check, Eye, X } from 'lucide-react';
import { useState } from 'react';

export default function ValidatePrescription() {
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, orderId: 'ORD-2024-1234', customer: 'John Smith', medication: 'Amoxicillin 500mg', quantity: 30, doctor: 'Dr. Sarah Johnson', uploadDate: '2024-12-10', status: 'Pending', autoValidation: { score: 95, issues: [] } },
    { id: 2, orderId: 'ORD-2024-1235', customer: 'Emily Davis', medication: 'Metformin 850mg', quantity: 60, doctor: 'Dr. Michael Chen', uploadDate: '2024-12-10', status: 'Pending', autoValidation: { score: 88, issues: ['Minor signature blur'] } },
    { id: 3, orderId: 'ORD-2024-1236', customer: 'Robert Wilson', medication: 'Lisinopril 10mg', quantity: 90, doctor: 'Dr. Amanda Brown', uploadDate: '2024-12-09', status: 'Pending', autoValidation: { score: 72, issues: ['Expiry date approaching', 'Dosage verification needed'] } },
    { id: 4, orderId: 'ORD-2024-1237', customer: 'Lisa Anderson', medication: 'Levothyroxine 50mcg', quantity: 30, doctor: 'Dr. James Miller', uploadDate: '2024-12-09', status: 'Approved', autoValidation: { score: 98, issues: [] } },
    { id: 5, orderId: 'ORD-2024-1238', customer: 'Michael Brown', medication: 'Atorvastatin 20mg', quantity: 30, doctor: 'Dr. Sarah Johnson', uploadDate: '2024-12-08', status: 'Rejected', autoValidation: { score: 45, issues: ['Prescription expired'] } }
  ]);

  const [selectedPrescription, setSelectedPrescription] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(90);
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);

  const handleApprove = (id: number) => {
    setPrescriptions(prescriptions.map(p => 
      p.id === id ? { ...p, status: 'Approved' } : p
    ));
    alert('Prescription approved successfully');
  };

  const handleReject = (id: number) => {
    setSelectedPrescription(id);
    setShowRejectModal(true);
  };

  const handleAutoApprove = () => {
    const updated = prescriptions.map(p => {
      if (p.status === 'Pending' && p.autoValidation.score >= autoApprovalThreshold) {
        return { ...p, status: 'Auto-Approved' };
      }
      return p;
    });
    setPrescriptions(updated);
    const count = updated.filter(p => p.status === 'Auto-Approved').length;
    alert(`${count} prescription(s) auto-approved based on AI validation`);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    if (selectedPrescription !== null) {
      setPrescriptions(prescriptions.map(p => 
        p.id === selectedPrescription ? { ...p, status: 'Rejected' } : p
      ));
      alert('Prescription rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedPrescription(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const pendingCount = prescriptions.filter(p => p.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1>Validate Prescription - MedBuddy</h1>
        <p className="text-neutral-600 mt-1">Review and approve customer prescription uploads with AI-powered automation</p>
      </div>

      {/* Automation Control Panel */}
      {/* <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-purple-900">AI-Powered Automation</h3>
              <p className="text-sm text-purple-700 mt-1">
                Auto-validate prescriptions using advanced OCR and compliance checking
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAutomationSettings(!showAutomationSettings)}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-purple-600" />
          </button>
        </div>

        {showAutomationSettings && (
          <div className="space-y-4 mt-4 pt-4 border-t border-purple-200">
            <div className="flex items-center justify-between">
              <label className="text-sm text-purple-900">Enable Automation</label>
              <button
                onClick={() => setAutomationEnabled(!automationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  automationEnabled ? 'bg-purple-600' : 'bg-neutral-300'
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
              <label className="text-sm text-purple-900 block mb-2">
                Auto-Approval Threshold: {autoApprovalThreshold}%
              </label>
              <input
                type="range"
                min="70"
                max="99"
                value={autoApprovalThreshold}
                onChange={(e) => setAutoApprovalThreshold(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-purple-700 mt-1">
                <span>Conservative (70%)</span>
                <span>Strict (99%)</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAutoApprove}
            disabled={!automationEnabled}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Run Auto-Approval
          </button>
          <div className="text-sm text-purple-700 flex items-center">
            {pendingCount} pending prescriptions ready for auto-validation
          </div>
        </div>
      </div> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
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
            <div className="text-2xl">{prescriptions.filter(p => p.status === 'Approved' || p.status === 'Auto-Approved').length}</div>
          </div>
          <div className="text-sm text-neutral-600">Approved Today</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl">{prescriptions.filter(p => p.status === 'Rejected').length}</div>
          </div>
          <div className="text-sm text-neutral-600">Rejected Today</div>
        </div>
      </div>

      {/* Prescription Queue */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2>Prescription Validation Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Order ID</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Customer</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Medication</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Quantity</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Prescribing Doctor</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Upload Date</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">AI Score</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">{prescription.orderId}</td>
                  <td className="px-6 py-4">{prescription.customer}</td>
                  <td className="px-6 py-4">{prescription.medication}</td>
                  <td className="px-6 py-4">{prescription.quantity}</td>
                  <td className="px-6 py-4 text-neutral-600">{prescription.doctor}</td>
                  <td className="px-6 py-4 text-neutral-600">{prescription.uploadDate}</td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`${getScoreColor(prescription.autoValidation.score)}`}>
                        {prescription.autoValidation.score}%
                      </span>
                      {prescription.autoValidation.issues.length > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          {prescription.autoValidation.issues[0]}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prescription.status === 'Approved' || prescription.status === 'Auto-Approved' ? 'bg-green-100 text-green-700' :
                      prescription.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Prescription"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {prescription.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(prescription.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(prescription.id)}
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
          <div className="text-sm text-neutral-600">Showing {prescriptions.length} prescriptions</div>
        </div>
      </div>

      {/* Validation Guidelines */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FileCheck className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-blue-900 mb-2">AI Validation Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI OCR extracts and verifies prescription details automatically</li>
              <li>• Validates physician license against medical registry database</li>
              <li>• Checks medication name, dosage, and quantity accuracy</li>
              <li>• Ensures prescription validity period (typically 12 months)</li>
              <li>• Detects tampering or alterations using image analysis</li>
              <li>• Auto-flags prescriptions requiring manual review (&lt;{autoApprovalThreshold}% confidence)</li>
            </ul>
          </div>
        </div>
      </div> */}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg">Reject Prescription</h3>
                <p className="text-sm text-neutral-600">Please provide a reason for rejection</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="e.g., Prescription expired, illegible signature, dosage mismatch..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedPrescription(null);
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