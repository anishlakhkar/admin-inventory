import api from './api';

// Backend UserResponse structure
export interface UserResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNo: string | null;
  platform: string | null;
  businessInfo: string | null;
  accountStatus: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  userTypes: string[];
  createdAt: string;
  updatedAt: string | null;
}

// Frontend UserRegistration structure (matching UserApproval.tsx)
export interface UserRegistration {
  id: number;
  name: string;
  email: string;
  phone: string;
  platform: 'MedBuddy' | 'MedBiz';
  userTypes: string[]; // Added to show actual user types
  businessName?: string;
  licenseNumber?: string;
  registrationDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
}

// Approval request for backend
export interface ApprovalRequest {
  accountStatus: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
}

// Helper function to parse businessInfo JSON
interface BusinessInfo {
  businessName?: string;
  licenseNumber?: string;
}

function parseBusinessInfo(businessInfo: string | null): { businessName?: string; licenseNumber?: string } {
  if (!businessInfo) {
    return {};
  }
  
  try {
    return JSON.parse(businessInfo) as BusinessInfo;
  } catch {
    // If parsing fails, return as is or try to extract from plain text
    return { businessName: businessInfo };
  }
}

// Helper function to map backend status to frontend status
function mapAccountStatus(accountStatus: string): 'Pending' | 'Approved' | 'Rejected' | 'Suspended' {
  switch (accountStatus) {
    case 'PENDING_APPROVAL':
      return 'Pending';
    case 'ACTIVE':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'SUSPENDED':
      return 'Suspended';
    default:
      return 'Pending';
  }
}

// Helper function to determine platform from userTypes and platform field
function determinePlatform(userTypes: string[], platform: string | null): 'MedBuddy' | 'MedBiz' {
  // If platform field is set, use it
  if (platform) {
    if (platform.toLowerCase().includes('medbuddy') || platform.toLowerCase().includes('b2c')) {
      return 'MedBuddy';
    }
    if (platform.toLowerCase().includes('medbiz') || platform.toLowerCase().includes('b2b')) {
      return 'MedBiz';
    }
  }
  
  // Otherwise, determine from userTypes
  if (userTypes && userTypes.length > 0) {
    const types = userTypes.map(t => t.toUpperCase());
    if (types.includes('B2C')) {
      return 'MedBuddy';
    }
    if (types.includes('B2B')) {
      return 'MedBiz';
    }
  }
  
  // Default to MedBuddy
  return 'MedBuddy';
}

// Helper function to format date
function formatDate(dateString: string | null): string {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return dateString;
    }
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return dateString;
  }
}

// Convert backend UserResponse to frontend UserRegistration
export function mapUserResponseToRegistration(user: UserResponse): UserRegistration {
  const businessInfo = parseBusinessInfo(user.businessInfo);
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
  
  const mapped = {
    id: user.id,
    name: fullName,
    email: user.email,
    phone: user.phoneNo || 'N/A',
    platform: determinePlatform(user.userTypes || [], user.platform),
    userTypes: user.userTypes || [], // Include actual user types
    businessName: businessInfo.businessName,
    licenseNumber: businessInfo.licenseNumber,
    registrationDate: formatDate(user.createdAt),
    status: mapAccountStatus(user.accountStatus),
  };
  
  return mapped;
}

export const userApprovalService = {
  // Test function to check if API is accessible without auth
  testConnection: async (): Promise<{ success: boolean; data?: any; error?: any }> => {
    try {
      console.log('[userApprovalService] Testing API connection...');
      const response = await api.get<UserResponse[]>('/users');
      console.log('[userApprovalService] ✅ API connection successful!', {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
        firstItem: response.data?.[0]
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('[userApprovalService] ❌ API connection failed!', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fullError: error
      });
      return { success: false, error };
    }
  },

  // Get all users
  getAllUsers: async (): Promise<UserRegistration[]> => {
    console.log('[userApprovalService] Fetching all users...');
    try {
      const response = await api.get<UserResponse[]>('/users');
      console.log('[userApprovalService] ✅ Received response:', {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
        rawData: response.data
      });
      
      if (!Array.isArray(response.data)) {
        console.error('[userApprovalService] ❌ Response data is not an array!', response.data);
        throw new Error('Response data is not an array');
      }
      
      if (response.data.length === 0) {
        console.warn('[userApprovalService] ⚠️ No users found in response');
        return [];
      }
      
      const mapped = response.data.map(mapUserResponseToRegistration);
      console.log('[userApprovalService] ✅ Mapped users successfully:', {
        count: mapped.length,
        mapped: mapped.map(m => ({ id: m.id, name: m.name, platform: m.platform, status: m.status }))
      });
      return mapped;
    } catch (error: any) {
      console.error('[userApprovalService] ❌ Error in getAllUsers:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get users by status (PENDING_APPROVAL, ACTIVE, REJECTED, SUSPENDED)
  getUsersByStatus: async (status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'): Promise<UserRegistration[]> => {
    const response = await api.get<UserResponse[]>(`/users/status/${status}`);
    return response.data.map(mapUserResponseToRegistration);
  },

  // Get pending users (users with PENDING_APPROVAL status)
  getPendingUsers: async (): Promise<UserRegistration[]> => {
    return userApprovalService.getUsersByStatus('PENDING_APPROVAL');
  },

  // Get user by ID (returns mapped UserRegistration)
  getUserById: async (id: number): Promise<UserRegistration> => {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return mapUserResponseToRegistration(response.data);
  },

  // Get raw user by ID (returns UserResponse for Settings)
  getUserByIdRaw: async (id: number): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  // Get all users raw (returns UserResponse[] for ticket assignment)
  getAllUsersRaw: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/users');
    return response.data;
  },

  // Approve user (set status to ACTIVE)
  approveUser: async (id: number): Promise<UserRegistration> => {
    const request: ApprovalRequest = { accountStatus: 'ACTIVE' };
    const response = await api.put<UserResponse>(`/users/${id}/approval`, request);
    return mapUserResponseToRegistration(response.data);
  },

  // Reject user (set status to REJECTED)
  rejectUser: async (id: number, _reason?: string): Promise<UserRegistration> => {
    const request: ApprovalRequest = { accountStatus: 'REJECTED' };
    const response = await api.put<UserResponse>(`/users/${id}/approval`, request);
    return mapUserResponseToRegistration(response.data);
  },

  // Suspend user (set status to SUSPENDED)
  suspendUser: async (id: number): Promise<UserRegistration> => {
    const request: ApprovalRequest = { accountStatus: 'SUSPENDED' };
    const response = await api.put<UserResponse>(`/users/${id}/approval`, request);
    return mapUserResponseToRegistration(response.data);
  },

  // Activate user (set status to ACTIVE)
  activateUser: async (id: number): Promise<UserRegistration> => {
    const request: ApprovalRequest = { accountStatus: 'ACTIVE' };
    const response = await api.put<UserResponse>(`/users/${id}/approval`, request);
    return mapUserResponseToRegistration(response.data);
  },

  // Get active users only (for Settings > Users & Roles)
  getActiveUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/users/status/ACTIVE');
    return response.data;
  },

  // Create new user manually (for Settings > Users & Roles)
  createUser: async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNo?: string;
    platform?: string;
    businessInfo?: string;
    userTypes: string[];
  }): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/auth/signup', userData);
    return response.data;
  },

  // Update user (including roles)
  updateUser: async (id: number, userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNo?: string;
    platform?: string;
    businessInfo?: string;
    accountStatus?: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
    userTypes?: string[];
  }): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
