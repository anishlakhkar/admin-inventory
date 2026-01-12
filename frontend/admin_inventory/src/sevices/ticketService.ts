import api from './api';

// Backend TicketResponse structure
export interface TicketResponse {
  ticketId: number;
  raisedBy: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  assignedTo: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  ticketType: 'B2B' | 'B2C' | 'WAREHOUSE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// Frontend Ticket interface (for SupportTickets page)
export interface Ticket {
  id: number;
  ticketNumber: string;
  type: 'B2C' | 'B2B' | 'WAREHOUSE';
  customerName: string;
  subject: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  created: string;
  lastUpdate: string;
  assignedTo: string;
  description?: string;
}

// Request DTOs
export interface CreateTicketRequest {
  raisedByUserId: number;
  title: string;
  description?: string;
  ticketType: 'B2B' | 'B2C' | 'WAREHOUSE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AssignTicketRequest {
  adminUserId: number;
  executiveId: number;
  comment?: string;
}

export interface UpdateTicketStatusRequest {
  userId: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  comment?: string;
}

export interface AddCommentRequest {
  userId: number;
  comment: string;
}

export interface TicketCommentResponse {
  commentId: number;
  ticketId: number;
  userId: number;
  comment: string;
  createdAt: string;
}

// Helper function to format ticket number
function formatTicketNumber(ticketId: number): string {
  return `TKT-2024-${ticketId.toString().padStart(4, '0')}`;
}

// Helper function to format date
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return dateString;
  }
}

// Helper function to get customer name
function getCustomerName(raisedBy: TicketResponse['raisedBy']): string {
  if (!raisedBy) return 'Unknown Customer';
  const firstName = raisedBy.firstName || '';
  const lastName = raisedBy.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || raisedBy.email?.split('@')[0] || 'Unknown Customer';
}

// Helper function to get assigned to name
function getAssignedToName(assignedTo: TicketResponse['assignedTo']): string {
  if (!assignedTo) return 'Unassigned';
  const firstName = assignedTo.firstName || '';
  const lastName = assignedTo.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || assignedTo.email?.split('@')[0] || 'Unassigned';
}

// Helper function to map ticket type (return as-is from backend)
function mapTicketType(ticketType: string): 'B2C' | 'B2B' | 'WAREHOUSE' {
  switch (ticketType.toUpperCase()) {
    case 'B2C':
      return 'B2C';
    case 'B2B':
      return 'B2B';
    case 'WAREHOUSE':
      return 'WAREHOUSE';
    default:
      return 'B2C';
  }
}

// Helper function to map status
function mapStatus(status: string): 'Open' | 'In Progress' | 'Resolved' | 'Closed' {
  switch (status.toUpperCase()) {
    case 'OPEN':
      return 'Open';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'RESOLVED':
      return 'Resolved';
    case 'CLOSED':
      return 'Closed';
    default:
      return 'Open';
  }
}

// Helper function to map priority
function mapPriority(priority: string): 'Critical' | 'High' | 'Medium' | 'Low' {
  switch (priority.toUpperCase()) {
    case 'CRITICAL':
      return 'Critical';
    case 'HIGH':
      return 'High';
    case 'MEDIUM':
      return 'Medium';
    case 'LOW':
      return 'Low';
    default:
      return 'Medium';
  }
}

// Map backend TicketResponse to frontend Ticket
export function mapTicketResponseToTicket(ticket: TicketResponse): Ticket {
  return {
    id: ticket.ticketId,
    ticketNumber: formatTicketNumber(ticket.ticketId),
    type: mapTicketType(ticket.ticketType),
    customerName: getCustomerName(ticket.raisedBy),
    subject: ticket.title,
    priority: mapPriority(ticket.priority),
    status: mapStatus(ticket.status),
    created: formatDate(ticket.createdAt),
    lastUpdate: formatDate(ticket.updatedAt || ticket.createdAt),
    assignedTo: getAssignedToName(ticket.assignedTo),
    description: ticket.description || undefined,
  };
}

export const ticketService = {
  // Get all tickets (with optional filters)
  getAllTickets: async (filters?: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    ticketType?: 'B2B' | 'B2C' | 'WAREHOUSE';
    assignedTo?: number;
  }): Promise<Ticket[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.ticketType) params.append('ticketType', filters.ticketType);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo.toString());

    const queryString = params.toString();
    const url = queryString ? `/tickets?${queryString}` : '/tickets';
    
    const response = await api.get<TicketResponse[]>(url);
    return response.data.map(mapTicketResponseToTicket);
  },

  // Get ticket by ID
  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await api.get<TicketResponse>(`/tickets/${id}`);
    return mapTicketResponseToTicket(response.data);
  },

  // Create ticket
  createTicket: async (request: CreateTicketRequest): Promise<Ticket> => {
    const response = await api.post<TicketResponse>('/tickets', request);
    return mapTicketResponseToTicket(response.data);
  },

  // Admin resolve ticket
  resolveTicket: async (id: number, comment?: string): Promise<Ticket> => {
    const userId = parseInt(localStorage.getItem('userId') || '0');
    const request: UpdateTicketStatusRequest = {
      userId,
      status: 'RESOLVED',
      comment: comment || undefined,
    };
    const response = await api.put<TicketResponse>(`/tickets/${id}/resolve`, request);
    return mapTicketResponseToTicket(response.data);
  },

  // Admin close ticket
  closeTicket: async (id: number, comment?: string): Promise<Ticket> => {
    const userId = parseInt(localStorage.getItem('userId') || '0');
    const request: UpdateTicketStatusRequest = {
      userId,
      status: 'CLOSED',
      comment: comment || undefined,
    };
    const response = await api.put<TicketResponse>(`/tickets/${id}/close`, request);
    return mapTicketResponseToTicket(response.data);
  },

  // Add comment to ticket
  addComment: async (id: number, comment: string): Promise<TicketCommentResponse> => {
    const userId = parseInt(localStorage.getItem('userId') || '0');
    const request: AddCommentRequest = {
      userId,
      comment,
    };
    const response = await api.post<TicketCommentResponse>(`/tickets/${id}/comments`, request);
    return response.data;
  },

  // Get ticket comments
  getTicketComments: async (id: number): Promise<TicketCommentResponse[]> => {
    const response = await api.get<TicketCommentResponse[]>(`/tickets/${id}/comments`);
    return response.data;
  },

  // Get ticket history
  getTicketHistory: async (id: number): Promise<any[]> => {
    const response = await api.get(`/tickets/${id}/history`);
    return response.data;
  },

  // Assign ticket to executive
  assignTicket: async (id: number, executiveId: number, comment?: string): Promise<Ticket> => {
    const adminUserId = parseInt(localStorage.getItem('userId') || '0');
    const request: AssignTicketRequest = {
      adminUserId,
      executiveId,
      comment: comment || undefined,
    };
    const response = await api.put<TicketResponse>(`/tickets/${id}/assign`, request);
    return mapTicketResponseToTicket(response.data);
  },
};
