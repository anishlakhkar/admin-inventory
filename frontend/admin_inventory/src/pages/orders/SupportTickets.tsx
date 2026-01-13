import { Building2, CheckCircle, Clock, Eye, Filter, MessageSquare, Send, User, XCircle, Loader2, Plus, Warehouse } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ticketService, type Ticket, type TicketCommentResponse, type CreateTicketRequest } from '../../sevices/ticketService';
import { userApprovalService, type UserResponse } from '../../sevices/userApprovalService';

export default function SupportTickets() {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]); // All tickets for stats
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]); // Filtered tickets for display
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketComments, setTicketComments] = useState<TicketCommentResponse[]>([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null); // Track which ticket action is loading
  
  // Create ticket form state (EXECUTIVE is frontend-only, mapped to WAREHOUSE for backend)
  const [createTicketForm, setCreateTicketForm] = useState<CreateTicketRequest & { assignedToUserId?: number; ticketTypeFrontend?: 'B2B' | 'B2C' | 'WAREHOUSE' | 'EXECUTIVE' }>({
    raisedByUserId: 0,
    title: '',
    description: '',
    ticketType: 'B2C',
    priority: 'MEDIUM',
    assignedToUserId: undefined,
    ticketTypeFrontend: 'B2C',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserToAssign, setSelectedUserToAssign] = useState<number | ''>('');

  // Fetch all tickets on component mount (for stats)
  useEffect(() => {
    fetchAllTickets();
  }, []);

  // Apply filters when filters change or allTickets change
  useEffect(() => {
    applyFilters();
  }, [typeFilter, statusFilter, priorityFilter, allTickets]);

  const fetchAllTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTickets = await ticketService.getAllTickets();
      setAllTickets(fetchedTickets);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch tickets';
      setError(errorMessage);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTickets];

    // Apply type filter (map frontend filter to backend type)
    if (typeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticketTypeFrontend = createTicketForm.ticketTypeFrontend || createTicketForm.ticketType;
    if (!createTicketForm.title || !ticketTypeFrontend || !createTicketForm.priority) {
      setError('Title, Type, and Priority are required');
      return;
    }

    const userId = parseInt(localStorage.getItem('userId') || '0');
    if (!userId) {
      setError('User ID not found. Please login again.');
      return;
    }

    setCreateLoading(true);
    setError(null);
    try {
      // Map EXECUTIVE to WAREHOUSE if selected (since backend doesn't support EXECUTIVE as ticket type)
      const ticketTypeForBackend = ticketTypeFrontend === 'EXECUTIVE' ? 'WAREHOUSE' : (ticketTypeFrontend as 'B2C' | 'B2B' | 'WAREHOUSE');
      
      const request: CreateTicketRequest = {
        raisedByUserId: userId,
        title: createTicketForm.title,
        description: createTicketForm.description || undefined,
        ticketType: ticketTypeForBackend,
        priority: createTicketForm.priority,
      };
      
      const newTicket = await ticketService.createTicket(request);
      
      // If assignedToUserId is provided, assign the ticket after creation
      if (createTicketForm.assignedToUserId) {
        try {
          await ticketService.assignTicket(newTicket.id, createTicketForm.assignedToUserId, 'Ticket assigned during creation');
        } catch (assignErr: any) {
          console.error('Error assigning ticket after creation:', assignErr);
          // Don't fail the whole operation if assignment fails
        }
      }
      
      setShowCreateModal(false);
      setCreateTicketForm({
        raisedByUserId: 0,
        title: '',
        description: '',
        ticketType: 'B2C',
        priority: 'MEDIUM',
        assignedToUserId: undefined,
        ticketTypeFrontend: 'B2C',
      });
      setError(null);
      // Refresh to get updated list
      await fetchAllTickets();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create ticket';
      setError(errorMessage);
      console.error('Error creating ticket:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const fetchTickets = async () => {
    await fetchAllTickets();
  };

  const fetchUsersForAssignment = async () => {
    setLoadingUsers(true);
    try {
      const users = await userApprovalService.getAllUsersRaw();
      // Filter active users only (for assignment)
      const activeUsers = users.filter(user => user.accountStatus === 'ACTIVE');
      setAvailableUsers(activeUsers);
    } catch (err: any) {
      console.error('Error fetching users for assignment:', err);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
    setResponseMessage('');
    setSelectedUserToAssign('');
    
    // Fetch users for assignment
    await fetchUsersForAssignment();
    
    // Fetch ticket comments
    try {
      const comments = await ticketService.getTicketComments(ticket.id);
      setTicketComments(comments);
    } catch (err: any) {
      console.error('Error fetching ticket comments:', err);
      setTicketComments([]);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !selectedUserToAssign) {
      return;
    }

    setActionLoading(selectedTicket.id);
    setError(null);
    try {
      const updatedTicket = await ticketService.assignTicket(
        selectedTicket.id,
        selectedUserToAssign as number,
        'Ticket assigned by admin'
      );
      setAllTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setFilteredTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      setSelectedUserToAssign('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign ticket';
      setError(errorMessage);
      console.error('Error assigning ticket:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: number) => {
    setActionLoading(id);
    setError(null);
    try {
      const updatedTicket = await ticketService.resolveTicket(id);
      setAllTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
      setFilteredTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(updatedTicket);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resolve ticket';
      setError(errorMessage);
      console.error('Error resolving ticket:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (id: number) => {
    setActionLoading(id);
    setError(null);
    try {
      const updatedTicket = await ticketService.closeTicket(id);
      setAllTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
      setFilteredTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(updatedTicket);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to close ticket';
      setError(errorMessage);
      console.error('Error closing ticket:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !selectedTicket) {
      return;
    }

    setActionLoading(selectedTicket.id);
    setError(null);
    try {
      const newComment = await ticketService.addComment(selectedTicket.id, responseMessage);
      setTicketComments(prev => [...prev, newComment]);
      setResponseMessage('');
      
      // Refresh ticket to get updated timestamp
      const updatedTicket = await ticketService.getTicketById(selectedTicket.id);
      setSelectedTicket(updatedTicket);
      setAllTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setFilteredTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send response';
      setError(errorMessage);
      console.error('Error sending response:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper function to format date (used in modal for comments)
  const formatDate = (dateString: string | null): string => {
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
  };

  // Calculate stats from all tickets (not filtered)
  // Helper function to map ticket type to display label
  const getTicketTypeLabel = (type: string): string => {
    switch (type) {
      case 'B2C': return 'MedBuddy';
      case 'B2B': return 'MedBiz';
      case 'WAREHOUSE': return 'Warehouse';
      case 'EXECUTIVE': return 'Executive';
      default: return type;
    }
  };

  const openTickets = allTickets.filter((t: Ticket) => t.status === 'Open').length;
  const inProgressTickets = allTickets.filter((t: Ticket) => t.status === 'In Progress').length;
  const criticalTickets = allTickets.filter((t: Ticket) => t.priority === 'Critical' && t.status !== 'Closed').length; // Exclude closed tickets
  const b2cTickets = allTickets.filter((t: Ticket) => t.type === 'B2C' && t.status !== 'Closed').length;
  const b2bTickets = allTickets.filter((t: Ticket) => t.type === 'B2B' && t.status !== 'Closed').length;
  const closedTickets = allTickets.filter((t: Ticket) => t.status === 'Closed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1>Support Tickets</h1>
        <p className="text-neutral-600 mt-1">Manage customer support tickets for B2C, B2B, and Warehouse</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error:</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchTickets}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl">{openTickets}</div>
          </div>
          <div className="text-sm text-neutral-600">Open Tickets</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl">{inProgressTickets}</div>
          </div>
          <div className="text-sm text-neutral-600">In Progress</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl">{criticalTickets}</div>
          </div>
          <div className="text-sm text-neutral-600">Critical Priority</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl">{b2cTickets}</div>
          </div>
          <div className="text-sm text-neutral-600">MedBuddy</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl">{b2bTickets}</div>
          </div>
          <div className="text-sm text-neutral-600">MedBiz</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="text-2xl">{closedTickets}</div>
          </div>
          <div className="text-sm text-neutral-600">Closed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-neutral-600" />
          <h2>Filters</h2>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="B2C">MedBuddy</option>
            <option value="B2B">MedBiz</option>
            <option value="WAREHOUSE">Warehouse</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {(typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
          
          <button
            onClick={() => {
              const userId = parseInt(localStorage.getItem('userId') || '0');
              setCreateTicketForm({
                raisedByUserId: userId,
                title: '',
                description: '',
                ticketType: 'B2C',
                priority: 'MEDIUM',
                assignedToUserId: undefined,
                ticketTypeFrontend: 'B2C',
              });
              setShowCreateModal(true);
              setError(null);
              fetchUsersForAssignment();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ml-auto"
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h2>Support Tickets ({filteredTickets.length})</h2>
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh tickets"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>
        
        {loading && allTickets.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Loader2 className="w-12 h-12 mx-auto mb-3 opacity-50 animate-spin" />
            <p>Loading tickets...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 sticky top-0">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Ticket #</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Type</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Customer</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Subject</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Priority</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Assigned To</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Created</th>
                    <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                        <td className="px-6 py-4">{ticket.ticketNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                            ticket.type === 'B2C' 
                              ? 'bg-purple-100 text-purple-700' 
                              : ticket.type === 'B2B'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ticket.type === 'B2C' ? <User className="w-3 h-3" /> : ticket.type === 'B2B' ? <Building2 className="w-3 h-3" /> : <Warehouse className="w-3 h-3" />}
                            {getTicketTypeLabel(ticket.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">{ticket.customerName}</td>
                        <td className="px-6 py-4">{ticket.subject}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                            ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                            ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            ticket.status === 'Open' ? 'bg-orange-100 text-orange-700' :
                            ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-600">{ticket.assignedTo}</td>
                        <td className="px-6 py-4 text-neutral-600 text-sm">{ticket.created}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewTicket(ticket)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                              disabled={loading}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                              <button
                                onClick={() => handleResolve(ticket.id)}
                                disabled={actionLoading === ticket.id || loading}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mark as Resolved"
                              >
                                {actionLoading === ticket.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {ticket.status !== 'Closed' && (
                              <button
                                onClick={() => handleClose(ticket.id)}
                                disabled={ticket.status !== 'Resolved' || actionLoading === ticket.id || loading}
                                className="p-1 text-neutral-600 hover:bg-neutral-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={ticket.status === 'Resolved' ? 'Close Ticket' : 'Close Ticket (Ticket must be resolved first)'}
                              >
                                {actionLoading === ticket.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-neutral-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium mb-1">No tickets found</p>
                        <p className="text-sm text-neutral-400">
                          {typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Tickets will appear here when created'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                Showing {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2>{selectedTicket.ticketNumber}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedTicket.type === 'B2C' 
                      ? 'bg-purple-100 text-purple-700' 
                      : selectedTicket.type === 'B2B'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {getTicketTypeLabel(selectedTicket.type)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedTicket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                    selectedTicket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                    selectedTicket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <p className="text-neutral-600">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Ticket Details */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Customer</div>
                  <div>{selectedTicket.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Status</div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedTicket.status === 'Open' ? 'bg-orange-100 text-orange-700' :
                    selectedTicket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    selectedTicket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                    'bg-neutral-100 text-neutral-700'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Assigned To</div>
                  <div>{selectedTicket.assignedTo}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Created</div>
                  <div>{selectedTicket.created}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Last Updated</div>
                  <div>{selectedTicket.lastUpdate}</div>
                </div>
              </div>

              {/* Assignment Section */}
              <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                <div className="text-sm text-neutral-600 mb-2 font-medium">Assign Ticket</div>
                <div className="flex gap-2">
                  <select
                    value={selectedUserToAssign}
                    onChange={(e) => setSelectedUserToAssign(e.target.value ? parseInt(e.target.value) : '')}
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={loadingUsers || actionLoading === selectedTicket.id}
                  >
                    <option value="">Select user to assign...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName} (${user.email})`
                          : user.email}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignTicket}
                    disabled={!selectedUserToAssign || actionLoading === selectedTicket.id}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {actionLoading === selectedTicket.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Assign
                  </button>
                </div>
                {loadingUsers && (
                  <p className="text-xs text-neutral-500 mt-2">Loading users...</p>
                )}
              </div>

              {/* Ticket Description */}
              <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                <div className="text-sm mb-2">
                  <strong>Description:</strong>
                </div>
                <p className="text-neutral-700">
                  {selectedTicket.description || 'No description provided'}
                </p>
              </div>

              {/* Ticket Comments */}
              {ticketComments.length > 0 && (
                <div className="border border-neutral-200 rounded-lg p-4">
                  <div className="text-sm font-medium mb-3">Comments ({ticketComments.length}):</div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {ticketComments.map((comment) => (
                      <div key={comment.commentId} className="border-l-2 border-blue-500 pl-3 py-2 bg-neutral-50 rounded">
                        <p className="text-sm text-neutral-700">{comment.comment}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Response Section */}
            <div className="border-t border-neutral-200 pt-6">
              <label className="block text-sm mb-2">Send Response</label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                rows={4}
                placeholder="Type your response to the customer..."
                disabled={actionLoading === selectedTicket.id}
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowTicketModal(false);
                    setResponseMessage('');
                    setTicketComments([]);
                  }}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading === selectedTicket.id}
                >
                  Cancel
                </button>
                {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                  <button
                    onClick={() => handleResolve(selectedTicket.id)}
                    disabled={actionLoading === selectedTicket.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === selectedTicket.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Mark as Resolved
                  </button>
                )}
                {selectedTicket.status === 'Resolved' && (
                  <button
                    onClick={() => handleClose(selectedTicket.id)}
                    disabled={actionLoading === selectedTicket.id}
                    className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === selectedTicket.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Close Ticket
                  </button>
                )}
                <button
                  onClick={handleSendResponse}
                  disabled={!responseMessage.trim() || actionLoading === selectedTicket.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedTicket.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2>Create New Ticket</h2>
                <p className="text-sm text-neutral-600 mt-1">Fill in the details to create a new support ticket</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateTicketForm({
                    raisedByUserId: 0,
                    title: '',
                    description: '',
                    ticketType: 'B2C',
                    priority: 'MEDIUM',
                    assignedToUserId: undefined,
                    ticketTypeFrontend: 'B2C',
                  });
                  setError(null);
                }}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                <p className="font-medium">Error:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={createTicketForm.title}
                  onChange={(e) => setCreateTicketForm({ ...createTicketForm, title: e.target.value })}
                  placeholder="Enter ticket title"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  value={createTicketForm.description}
                  onChange={(e) => setCreateTicketForm({ ...createTicketForm, description: e.target.value })}
                  placeholder="Enter ticket description (optional)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Type *</label>
                  <select
                    required
                    value={createTicketForm.ticketTypeFrontend || createTicketForm.ticketType}
                    onChange={(e) => {
                      const frontendType = e.target.value as 'B2C' | 'B2B' | 'WAREHOUSE' | 'EXECUTIVE';
                      setCreateTicketForm({ 
                        ...createTicketForm, 
                        ticketTypeFrontend: frontendType,
                        ticketType: frontendType === 'EXECUTIVE' ? 'WAREHOUSE' : frontendType
                      });
                    }}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="B2C">MedBuddy</option>
                    <option value="B2B">MedBiz</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">Priority *</label>
                  <select
                    required
                    value={createTicketForm.priority}
                    onChange={(e) => setCreateTicketForm({ ...createTicketForm, priority: e.target.value as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Assign To (Optional)</label>
                <select
                  value={createTicketForm.assignedToUserId || ''}
                  onChange={(e) => setCreateTicketForm({ ...createTicketForm, assignedToUserId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingUsers}
                >
                  <option value="">Unassigned</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName} (${user.email})`
                        : user.email}
                    </option>
                  ))}
                </select>
                {loadingUsers && (
                  <p className="text-xs text-neutral-500 mt-1">Loading users...</p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateTicketForm({
                      raisedByUserId: 0,
                      title: '',
                      description: '',
                      ticketType: 'B2C',
                      priority: 'MEDIUM',
                      assignedToUserId: undefined,
                      ticketTypeFrontend: 'B2C',
                    });
                    setError(null);
                  }}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !createTicketForm.title}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
