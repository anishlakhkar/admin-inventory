import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  active: boolean;
  mfaEnabled: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  username: string;
  email: string;
  password?: string;
  active: boolean;
  mfaEnabled: boolean;
  roleIds?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const userService = {
  getAll: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>('/users', { params });
    return response.data;
  },

  getPending: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>('/users/pending', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (user: UserRequest): Promise<User> => {
    const response = await api.post<User>('/users', user);
    return response.data;
  },

  update: async (id: string, user: UserRequest): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, user);
    return response.data;
  },

  approve: async (id: string): Promise<User> => {
    const response = await api.put<User>(`/users/${id}/approve`);
    return response.data;
  },
};

