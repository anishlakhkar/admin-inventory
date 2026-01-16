import { useState, useEffect } from 'react';
import { FileText, Check, X, Eye, AlertTriangle, Plus, Loader2, Upload } from 'lucide-react';
import { complianceService, type RegulatoryDocument, type DocumentType, type RegulatoryDocumentRequest } from '../../sevices/complianceService';

const DOCUMENT_TYPE_MAP: Record<string, DocumentType> = {
  'Business License': 'BUSINESS_LICENSE',
  'Pharmaceutical License': 'PHARMACEUTICAL_LICENSE',
  'Tax Certificate': 'TAX_CERTIFICATE',
  'GMP Certificate': 'GMP_CERTIFICATE',
  'Insurance Certificate': 'INSURANCE_CERTIFICATE',
  'Quality Certification': 'QUALITY_CERTIFICATION',
};

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'BUSINESS_LICENSE': 'Business License',
  'PHARMACEUTICAL_LICENSE': 'Pharmaceutical License',
  'TAX_CERTIFICATE': 'Tax Certificate',
  'GMP_CERTIFICATE': 'GMP Certificate',
  'INSURANCE_CERTIFICATE': 'Insurance Certificate',
  'QUALITY_CERTIFICATION': 'Quality Certification',
};

const STATUS_LABELS: Record<string, string> = {
  'PENDING_REVIEW': 'Pending Review',
  'VERIFIED': 'Verified',
  'REJECTED': 'Rejected',
  'AUTO_VERIFIED': 'Auto-Verified',
  'EXPIRING_SOON': 'Expiring Soon',
};

export default function CheckDocs() {
  const [documents, setDocuments] = useState<RegulatoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<RegulatoryDocument | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [creating, setCreating] = useState(false);

  const [inputMethod, setInputMethod] = useState<'upload' | 'manual'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<RegulatoryDocumentRequest & { extractedText?: string }>({
    companyName: '',
    documentType: 'BUSINESS_LICENSE',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    fileType: 'PDF',
    extractedText: '',
    uploadDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await complianceService.getAllDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.documentType) {
      setError('Company name and document type are required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      const request: RegulatoryDocumentRequest = {
        companyName: formData.companyName,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber || undefined,
        issueDate: formData.issueDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        issuingAuthority: formData.issuingAuthority || undefined,
        fileType: formData.fileType || 'PDF',
        extractedText: formData.extractedText || undefined,
        uploadDate: formData.uploadDate || undefined,
      };

      await complianceService.createDocument(request);
      setShowAddModal(false);
      setFormData({
        companyName: '',
        documentType: 'BUSINESS_LICENSE',
        documentNumber: '',
        issueDate: '',
        expiryDate: '',
        issuingAuthority: '',
        fileType: 'PDF',
        extractedText: '',
        uploadDate: new Date().toISOString().split('T')[0],
      });
      await fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create document');
      console.error('Error creating document:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      setError(null);
      await complianceService.verifyDocument(id);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to verify document');
      console.error('Error verifying document:', err);
    }
  };

  const handleReject = (doc: RegulatoryDocument) => {
    setSelectedDoc(doc);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim() || !selectedDoc) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setError(null);
      await complianceService.rejectDocument(selectedDoc.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedDoc(null);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reject document');
      console.error('Error rejecting document:', err);
    }
  };

  const handleViewDocument = async (doc: RegulatoryDocument) => {
    try {
      setError(null);
      const fullDoc = await complianceService.getDocumentById(doc.id);
      setSelectedDoc(fullDoc);
      setShowViewModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch document details');
      console.error('Error fetching document:', err);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'AUTO_VERIFIED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED': 
        return 'bg-red-100 text-red-700';
      case 'EXPIRING_SOON': 
        return 'bg-orange-100 text-orange-700';
      default: 
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-neutral-600';
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const pendingCount = documents.filter(d => d.status === 'PENDING_REVIEW').length;
  const expiringCount = documents.filter(d => d.status === 'EXPIRING_SOON').length;
  const verifiedCount = documents.filter(d => d.status === 'VERIFIED' || d.status === 'AUTO_VERIFIED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h1>Check Regulatory Docs</h1>
          <p className="text-neutral-600 mt-1">Verify supplier regulatory documentation and compliance</p>
          </div>
          <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
          <Plus className="w-4 h-4" />
          Add Document
          </button>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

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
            <div className="text-2xl">{verifiedCount}</div>
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
        {loading ? (
          <div className="p-12 text-center text-neutral-600">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading documents...
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Company</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Document Type</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Document Number</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Issue Date</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Expiry Date</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Issuing Authority</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Upload Date</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">File Type</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Score</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
                <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                <tr key={doc.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                        <td className="px-6 py-4">{doc.companyName}</td>
                        <td className="px-6 py-4">{DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}</td>
                        <td className="px-6 py-4 text-neutral-600">{doc.documentNumber || 'N/A'}</td>
                        <td className="px-6 py-4 text-neutral-600">{doc.issueDate || 'N/A'}</td>
                        <td className="px-6 py-4 text-neutral-600">{doc.expiryDate || 'N/A'}</td>
                        <td className="px-6 py-4 text-neutral-600">{doc.issuingAuthority || 'N/A'}</td>
                  <td className="px-6 py-4 text-neutral-600">{doc.uploadDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                            {doc.fileType || 'PDF'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                            <span className={`font-medium ${getScoreColor(doc.validationScore)}`}>
                              {doc.validationScore || 'N/A'}%
                      </span>
                            {doc.validationIssues && doc.validationIssues.length > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                                {Array.isArray(doc.validationIssues) 
                                  ? doc.validationIssues[0] 
                                  : JSON.parse(doc.validationIssues || '[]')[0]}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}>
                            {STATUS_LABELS[doc.status] || doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewDocument(doc)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {doc.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            onClick={() => handleVerify(doc.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Verify"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                                  onClick={() => handleReject(doc)}
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-6 py-12 text-center text-neutral-500">
                        No documents found
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">Showing {documents.length} documents</div>
        </div>
          </>
        )}
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add Document</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    companyName: '',
                    documentType: 'BUSINESS_LICENSE',
                    documentNumber: '',
                    issueDate: '',
                    expiryDate: '',
                    issuingAuthority: '',
                    fileType: 'PDF',
                    extractedText: '',
                    uploadDate: new Date().toISOString().split('T')[0],
                  });
                  setSelectedFile(null);
                  setInputMethod('manual');
                  setError(null);
                }}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Document Type *</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Document Number</label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">File Type</label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PDF">PDF</option>
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Upload Date</label>
                  <input
                    type="date"
                    value={formData.uploadDate}
                    onChange={(e) => setFormData({ ...formData, uploadDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

          <div>
                <label className="block text-sm font-medium mb-1">Document Text (for validation)</label>
                <textarea
                  value={formData.extractedText}
                  onChange={(e) => setFormData({ ...formData, extractedText: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Enter the document text content for validation scoring..."
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Enter the document text to calculate validation score. This text will be analyzed for keywords, dates, and quality.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      companyName: '',
                      documentType: 'BUSINESS_LICENSE',
                      documentNumber: '',
                      issueDate: '',
                      expiryDate: '',
                      issuingAuthority: '',
                      fileType: 'PDF',
                      extractedText: '',
                      uploadDate: new Date().toISOString().split('T')[0],
                    });
                    setError(null);
                  }}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {creating ? 'Creating...' : 'Create Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {showViewModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Document Information</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDoc(null);
                }}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-600">Company Name</label>
                  <p className="font-medium">{selectedDoc.companyName}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Document Type</label>
                  <p className="font-medium">{DOCUMENT_TYPE_LABELS[selectedDoc.documentType] || selectedDoc.documentType}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Document Number</label>
                  <p className="font-medium">{selectedDoc.documentNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Issuing Authority</label>
                  <p className="font-medium">{selectedDoc.issuingAuthority || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Issue Date</label>
                  <p className="font-medium">{selectedDoc.issueDate || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Expiry Date</label>
                  <p className="font-medium">{selectedDoc.expiryDate || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Upload Date</label>
                  <p className="font-medium">{selectedDoc.uploadDate}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">File Type</label>
                  <p className="font-medium">{selectedDoc.fileType || 'PDF'}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Validation Score</label>
                  <p className={`font-medium ${getScoreColor(selectedDoc.validationScore)}`}>
                    {selectedDoc.validationScore || 'N/A'}%
                  </p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedDoc.status)}`}>
                    {STATUS_LABELS[selectedDoc.status] || selectedDoc.status}
                  </span>
                </div>
                {selectedDoc.keywordMatches !== undefined && (
                  <div>
                    <label className="text-sm text-neutral-600">Keyword Matches</label>
                    <p className="font-medium">{selectedDoc.keywordMatches}</p>
                  </div>
                )}
                {selectedDoc.daysUntilExpiry !== undefined && (
                  <div>
                    <label className="text-sm text-neutral-600">Days Until Expiry</label>
                    <p className="font-medium">{selectedDoc.daysUntilExpiry}</p>
                  </div>
                )}
      </div>

              {selectedDoc.validationIssues && (
                <div>
                  <label className="text-sm text-neutral-600">Validation Issues</label>
                  <div className="mt-1">
                    {Array.isArray(selectedDoc.validationIssues) ? (
                      selectedDoc.validationIssues.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-orange-600">
                          {selectedDoc.validationIssues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-neutral-600">No issues found</p>
                      )
                    ) : (
                      <ul className="list-disc list-inside text-sm text-orange-600">
                        {JSON.parse(selectedDoc.validationIssues || '[]').map((issue: string, idx: number) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedDoc.verifiedBy && (
                <div>
                  <label className="text-sm text-neutral-600">Verified By</label>
                  <p className="font-medium">{selectedDoc.verifiedBy}</p>
                </div>
              )}

              {selectedDoc.verifiedAt && (
                <div>
                  <label className="text-sm text-neutral-600">Verified At</label>
                  <p className="font-medium">{selectedDoc.verifiedAt}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedDoc && (
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