import api from './api';

export type DocumentType = 
  | 'BUSINESS_LICENSE'
  | 'PHARMACEUTICAL_LICENSE'
  | 'TAX_CERTIFICATE'
  | 'GMP_CERTIFICATE'
  | 'INSURANCE_CERTIFICATE'
  | 'QUALITY_CERTIFICATION';

export type DocumentStatus = 
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'AUTO_VERIFIED'
  | 'EXPIRING_SOON';

export type ExpiryStatus = 
  | 'VALID'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'NOT_FOUND';

export interface RegulatoryDocument {
  id: number;
  supplierId?: string;
  companyName: string;
  documentType: DocumentType;
  documentNumber?: string;
  documentFileUrl?: string;
  fileType?: string;
  fileSize?: number;
  uploadDate: string;
  issueDate?: string;
  expiryDate?: string;
  validationScore?: number;
  validationIssues?: string[];
  keywordMatches?: number;
  expiryStatus?: ExpiryStatus;
  daysUntilExpiry?: number;
  status: DocumentStatus;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  issuingAuthority?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegulatoryDocumentRequest {
  supplierId?: string;
  companyName: string;
  documentType: DocumentType;
  documentNumber?: string;
  documentFileUrl?: string;
  fileType?: string;
  fileSize?: number;
  uploadDate?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  extractedText?: string; // For manual text entry
}

export interface RejectDocumentRequest {
  rejectionReason: string;
}

export const complianceService = {
  // Get all documents
  getAllDocuments: async (status?: DocumentStatus): Promise<RegulatoryDocument[]> => {
    const params: any = {};
    if (status) {
      params.status = status;
    }
    const response = await api.get<RegulatoryDocument[]>('/compliance/documents', { params });
    return response.data;
  },

  // Get document by ID
  getDocumentById: async (id: number): Promise<RegulatoryDocument> => {
    const response = await api.get<RegulatoryDocument>(`/compliance/documents/${id}`);
    return response.data;
  },

  // Create new document
  createDocument: async (request: RegulatoryDocumentRequest): Promise<RegulatoryDocument> => {
    const response = await api.post<RegulatoryDocument>('/compliance/documents', request);
    return response.data;
  },

  // Verify document
  verifyDocument: async (id: number, verifiedBy?: string): Promise<RegulatoryDocument> => {
    const params: any = {};
    if (verifiedBy) {
      params.verifiedBy = verifiedBy;
    }
    const response = await api.post<RegulatoryDocument>(
      `/compliance/documents/${id}/verify`,
      {},
      { params }
    );
    return response.data;
  },

  // Reject document
  rejectDocument: async (
    id: number,
    rejectionReason: string,
    rejectedBy?: string
  ): Promise<RegulatoryDocument> => {
    const params: any = {};
    if (rejectedBy) {
      params.rejectedBy = rejectedBy;
    }
    const response = await api.post<RegulatoryDocument>(
      `/compliance/documents/${id}/reject`,
      { rejectionReason },
      { params }
    );
    return response.data;
  },

  // Run auto-verification
  runAutoVerification: async (threshold?: number): Promise<RegulatoryDocument[]> => {
    const params: any = {};
    if (threshold) {
      params.threshold = threshold;
    }
    const response = await api.post<RegulatoryDocument[]>(
      '/compliance/documents/auto-verify',
      {},
      { params }
    );
    return response.data;
  },

  // Run expiry check
  runExpiryCheck: async (alertDays?: number): Promise<RegulatoryDocument[]> => {
    const params: any = {};
    if (alertDays) {
      params.alertDays = alertDays;
    }
    const response = await api.post<RegulatoryDocument[]>(
      '/compliance/documents/expiry-check',
      {},
      { params }
    );
    return response.data;
  },

  // Delete document
  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/compliance/documents/${id}`);
  },
};
