import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

// Backend LoginResponse structure
export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  userTypes: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    // Backend returns 'token' not 'accessToken', store it as 'accessToken' for consistency with existing code
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
      // Store userId for potential future use
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId.toString());
      }
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userTypes');
  },

  getCurrentUser: async (): Promise<UserInfo> => {
    const response = await api.get<UserInfo>('/auth/me');
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  // Check if current user is admin
  isAdmin: (): boolean => {
    const userTypesStr = localStorage.getItem('userTypes');
    if (!userTypesStr) {
      return false;
    }
    try {
      const userTypes: string[] = JSON.parse(userTypesStr);
      return Array.isArray(userTypes) && userTypes.includes('ADMIN');
    } catch (e) {
      console.error('Error parsing userTypes:', e);
      return false;
    }
  },

  // Check if user types from response include ADMIN
  isAdminUser: (userTypes: string[]): boolean => {
    return Array.isArray(userTypes) && userTypes.some(type => 
      type.toUpperCase() === 'ADMIN'
    );
  },
};

