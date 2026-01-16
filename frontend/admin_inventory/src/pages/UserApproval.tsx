import { useState, useEffect } from 'react';
import { UserCheck, Mail, Save, Send, CheckCircle, XCircle, Clock, Filter, Loader2, Ban, PlayCircle } from 'lucide-react';
import { userApprovalService } from '../sevices/userApprovalService';
import type { UserRegistration } from '../sevices/userApprovalService';

type UserTypeFilter = 'All' | 'ADMIN' | 'B2B' | 'B2C' | 'EXECUTIVE' | 'WAREHOUSE';
type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Suspended';

export default function UserApproval() {
  const [activeTab, setActiveTab] = useState<'settings' | 'pending'>('settings');
  const [filterUserType, setFilterUserType] = useState<UserTypeFilter>('All');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-approval settings
  const [autoApprovalSettings, setAutoApprovalSettings] = useState({
    medBuddyAutoApproval: true,
    medBizAutoApproval: false,
    medBizRequireManualReview: true,
    notifyAdminOnNewRegistration: true,
    sendWelcomeEmail: true
  });

  // Email template settings
  const [emailTemplates, setEmailTemplates] = useState({
    welcomeSubject: 'Welcome to BlueWal Drugs!',
    welcomeBody: 'Dear {{name}},\n\nWelcome to BlueWal Drugs! Your registration for {{platform}} has been approved.\n\nYour login credentials:\nEmail: {{email}}\n\nPlease log in to get started.\n\nBest regards,\nBlueWal Drugs Team',
    rejectionSubject: 'Registration Update',
    rejectionBody: 'Dear {{name}},\n\nThank you for your interest in BlueWal Drugs. Unfortunately, we are unable to approve your {{platform}} registration at this time.\n\nReason: {{reason}}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nBlueWal Drugs Team',
    pendingReviewSubject: 'Registration Under Review',
    pendingReviewBody: 'Dear {{name}},\n\nThank you for registering with BlueWal Drugs {{platform}}.\n\nYour application is currently under review. We will notify you once the review is complete, typically within 1-2 business days.\n\nBest regards,\nBlueWal Drugs Team'
  });

  // Real registrations from backend
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);

  // Fetch users from backend on component mount and when tab changes
  useEffect(() => {
    fetchUsers();
  }, []);

  // Log when registrations state changes (for debugging)
  useEffect(() => {
    if (registrations.length > 0) {
      const userTypes = Array.from(new Set(registrations.flatMap(reg => reg.userTypes || []))).sort();
      console.log('[UserApproval] Registrations loaded:', {
        count: registrations.length,
        userTypes,
        sample: registrations.slice(0, 3).map(r => ({ 
          id: r.id, 
          name: r.name, 
          userTypes: r.userTypes, 
          status: r.status 
        }))
      });
    }
  }, [registrations.length]); // Only log when count changes, not on every render

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, test the API connection
      console.log('[UserApproval] Testing API connection...');
      const connectionTest = await userApprovalService.testConnection();
      
      if (!connectionTest.success) {
        throw connectionTest.error || new Error('API connection test failed');
      }
      
      console.log('[UserApproval] API connection successful, fetching users...');
      const users = await userApprovalService.getAllUsers();
      
      console.log('[UserApproval] ✅ Successfully fetched users:', {
        count: users.length,
        users: users.map(u => ({ id: u.id, name: u.name, email: u.email, platform: u.platform, status: u.status }))
      });
      
      setRegistrations(users);
      
      if (users.length === 0) {
        console.warn('[UserApproval] ⚠️ No users returned from API');
      }
    } catch (err: any) {
      console.error('[UserApproval] ❌ Error fetching users - Full error:', err);
      console.error('[UserApproval] Error details:', {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config
      });
      
      let errorMessage = 'Failed to fetch users. ';
      
      if (err.response) {
        // Server responded with error status
        console.error('[UserApproval] Response status:', err.response.status);
        console.error('[UserApproval] Response data:', err.response.data);
        errorMessage += `Server error (${err.response.status}): ${err.response?.data?.message || err.response?.statusText || 'Unknown error'}`;
      } else if (err.request) {
        // Request was made but no response received
        console.error('[UserApproval] ❌ No response received. Is the backend running?');
        console.error('[UserApproval] Request details:', {
          url: err.config?.url,
          baseURL: err.config?.baseURL,
          method: err.config?.method,
          timeout: err.config?.timeout,
          code: err.code,
          message: err.message
        });
        
        // Check for specific error codes
        let specificError = '';
        if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
          specificError = '\n\n❌ Connection Refused: Backend is not running or not accessible on http://localhost:9090';
        } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
          specificError = '\n\n❌ Network Error: Check CORS configuration or firewall settings';
        } else if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
          specificError = '\n\n❌ Request Timeout: Backend is taking too long to respond';
        }
        
        errorMessage = `Cannot connect to backend at ${err.config?.baseURL || 'http://localhost:9090/api'}${err.config?.url || '/users'}.${specificError}\n\nPlease ensure:\n` +
          '1. Backend is running on http://localhost:9090\n' +
          '2. CORS is properly configured (check backend application.properties)\n' +
          '3. Check browser Network tab for detailed error\n' +
          '4. Try accessing http://localhost:9090/api/users directly in browser';
      } else {
        // Error in request setup
        errorMessage += err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    console.log('Saving auto-approval settings:', autoApprovalSettings);
    // Settings saved - changes will be reflected immediately
    setError(null);
  };

  const handleSaveEmailTemplates = () => {
    console.log('Saving email templates:', emailTemplates);
    // Email templates saved - changes will be reflected immediately
    setError(null);
    setToastMessage('Email templates saved successfully');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleApproveUser = async (id: number) => {
    const user = registrations.find(r => r.id === id);
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userApprovalService.approveUser(id);
      setRegistrations(prev => prev.map(r => 
        r.id === id ? updatedUser : r
      ));
      // Success - user status updated in the table, no alert needed
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve user';
      setError(errorMessage);
      console.error('Error approving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUser = async (id: number) => {
    const user = registrations.find(r => r.id === id);
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userApprovalService.rejectUser(id);
      setRegistrations(prev => prev.map(r => 
        r.id === id ? updatedUser : r
      ));
      // Success - user status updated in the table, no alert needed
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reject user';
      setError(errorMessage);
      console.error('Error rejecting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (id: number) => {
    const user = registrations.find(r => r.id === id);
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userApprovalService.suspendUser(id);
      setRegistrations(prev => prev.map(r => 
        r.id === id ? updatedUser : r
      ));
      // Success - user status updated in the table, no alert needed
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to suspend user';
      setError(errorMessage);
      console.error('Error suspending user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (id: number) => {
    const user = registrations.find(r => r.id === id);
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userApprovalService.activateUser(id);
      setRegistrations(prev => prev.map(r => 
        r.id === id ? updatedUser : r
      ));
      // Success - user status updated in the table, no alert needed
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to activate user';
      setError(errorMessage);
      console.error('Error activating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = (templateType: string) => {
    // Test email sent - action logged, no alert needed
    console.log(`Test email sent for template: ${templateType}`);
    setError(null);
    setToastMessage(`Test email sent for ${templateType}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filteredRegistrations = registrations.filter(reg => {
    // Filter by UserType
    const matchesUserType = filterUserType === 'All' || 
      (reg.userTypes && reg.userTypes.length > 0 && reg.userTypes.includes(filterUserType));
    
    // Filter by Status
    const matchesStatus = filterStatus === 'All' || reg.status === filterStatus;
    
    return matchesUserType && matchesStatus;
  });

  // Get unique user types from all registrations for filter options
  const availableUserTypes = Array.from(
    new Set(registrations.flatMap(reg => reg.userTypes || []))
  ).sort() as string[];

  // Log filtered results (only when filters are active)
  if (filterUserType !== 'All' || filterStatus !== 'All') {
    console.log('[UserApproval] Filtered results:', {
      total: registrations.length,
      filtered: filteredRegistrations.length,
      filterUserType,
      filterStatus,
      availableUserTypes
    });
  }

  const pendingCount = registrations.filter(r => r.status === 'Pending').length;
  // Helper function to map user type to display label
  const getUserTypeLabel = (userType: string): string => {
    switch (userType.toUpperCase()) {
      case 'B2C': return 'MedBuddy';
      case 'B2B': return 'MedBiz';
      default: return userType;
    }
  };

  const approvedCount = registrations.filter(r => r.status === 'Approved').length;
  const rejectedCount = registrations.filter(r => r.status === 'Rejected').length;
  const suspendedCount = registrations.filter(r => r.status === 'Suspended').length;

  const tabs = [
    { id: 'settings', label: 'Auto-Approval Settings', icon: UserCheck },
    { id: 'pending', label: `Pending Registrations (${pendingCount})`, icon: Clock }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1>User Registration & Approval</h1>
        <p className="text-neutral-600 mt-1">
          Manage user registration approvals and email notifications for MedBuddy (B2C) and MedBiz (B2B)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error:</p>
          <div className="text-sm mt-1 whitespace-pre-line">{error}</div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Retry
            </button>
            <button
              onClick={() => {
                const testUrl = 'http://localhost:9090/api/users';
                console.log('[Test] Opening backend URL in new tab:', testUrl);
                window.open(testUrl, '_blank');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Test Backend URL
            </button>
          </div>
          <div className="mt-3 p-2 bg-red-100 rounded text-xs">
            <p className="font-medium">Debugging Steps:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Check if backend is running: Open http://localhost:9090/api/users in browser</li>
              <li>Check browser Console (F12) for detailed error messages</li>
              <li>Check browser Network tab to see the actual HTTP request</li>
              <li>Verify backend CORS allows your frontend origin</li>
            </ol>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Pending Approval</p>
              <p className="text-2xl mt-1 text-yellow-900">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Approved</p>
              <p className="text-2xl mt-1 text-green-900">{approvedCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Rejected</p>
              <p className="text-2xl mt-1 text-red-900">{rejectedCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Suspended</p>
              <p className="text-2xl mt-1 text-orange-900">{suspendedCount}</p>
            </div>
            <Ban className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#461E96] text-[#461E96]'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Auto-Approval Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Platform-specific Settings */}
              <div>
                <h2 className="mb-4">Platform Auto-Approval Settings</h2>
                
                <div className="space-y-4">
                  {/* MedBuddy Settings */}
                  {/* <div className="p-4 border border-neutral-200 rounded-lg bg-blue-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm">MedBuddy (B2C) - Auto-Approval</div>
                        <div className="text-xs text-neutral-600 mt-1">
                          Automatically approve individual customer registrations
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoApprovalSettings.medBuddyAutoApproval}
                          onChange={(e) => setAutoApprovalSettings({ 
                            ...autoApprovalSettings, 
                            medBuddyAutoApproval: e.target.checked 
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {autoApprovalSettings.medBuddyAutoApproval && (
                      <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                        ✓ New MedBuddy registrations will be approved automatically and users will receive welcome emails
                      </div>
                    )}
                  </div> */}

                  {/* MedBiz Settings */}
                  <div className="p-4 border border-neutral-200 rounded-lg bg-purple-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm">MedBiz (B2B) - Auto-Approval</div>
                        <div className="text-xs text-neutral-600 mt-1">
                          Automatically approve business registrations (requires valid license)
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoApprovalSettings.medBizAutoApproval}
                          onChange={(e) => setAutoApprovalSettings({ 
                            ...autoApprovalSettings, 
                            medBizAutoApproval: e.target.checked,
                            medBizRequireManualReview: !e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    {!autoApprovalSettings.medBizAutoApproval && (
                      <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                        ⚠ Manual review required - Admin approval needed for all MedBiz registrations
                      </div>
                    )}
                  </div>

                  {/* Admin Notification */}
                  <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <div className="text-sm">Admin Notifications</div>
                      <div className="text-xs text-neutral-600 mt-1">
                        Notify administrators of all new registrations
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoApprovalSettings.notifyAdminOnNewRegistration}
                      onChange={(e) => setAutoApprovalSettings({ 
                        ...autoApprovalSettings, 
                        notifyAdminOnNewRegistration: e.target.checked 
                      })}
                      className="w-4 h-4"
                    />
                  </label>

                  {/* Welcome Email */}
                  <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <div className="text-sm">Send Welcome Emails</div>
                      <div className="text-xs text-neutral-600 mt-1">
                        Automatically send welcome emails to approved users
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoApprovalSettings.sendWelcomeEmail}
                      onChange={(e) => setAutoApprovalSettings({ 
                        ...autoApprovalSettings, 
                        sendWelcomeEmail: e.target.checked 
                      })}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                <div className="pt-4 border-t border-neutral-200 mt-6">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Settings
                  </button>
                </div>
              </div>

              {/* Email Templates */}
              <div className="pt-6 border-t border-neutral-200">
                <h2 className="mb-4">Email Templates</h2>

                <div className="space-y-6">
                  {/* Welcome Email Template */}
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm">Welcome Email Template</div>
                        <div className="text-xs text-neutral-600 mt-1">
                          Sent to users when their registration is approved
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendTestEmail('Welcome Email')}
                        className="px-3 py-1 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Test Email
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1">Subject Line</label>
                        <input
                          type="text"
                          value={emailTemplates.welcomeSubject}
                          onChange={(e) => setEmailTemplates({ 
                            ...emailTemplates, 
                            welcomeSubject: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Email Body</label>
                        <textarea
                          value={emailTemplates.welcomeBody}
                          onChange={(e) => setEmailTemplates({ 
                            ...emailTemplates, 
                            welcomeBody: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                          rows={6}
                        />
                        <div className="text-xs text-neutral-500 mt-1">
                          Available variables: {'{{'} name {'}}'}, {'{{'} email {'}}'}, {'{{'} platform {'}}'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Review Email Template */}
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm">Pending Review Email Template</div>
                        <div className="text-xs text-neutral-600 mt-1">
                          Sent to users when their registration requires manual review
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendTestEmail('Pending Review Email')}
                        className="px-3 py-1 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Test Email
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1">Subject Line</label>
                        <input
                          type="text"
                          value={emailTemplates.pendingReviewSubject}
                          onChange={(e) => setEmailTemplates({ 
                            ...emailTemplates, 
                            pendingReviewSubject: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Email Body</label>
                        <textarea
                          value={emailTemplates.pendingReviewBody}
                          onChange={(e) => setEmailTemplates({ 
                            ...emailTemplates, 
                            pendingReviewBody: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                          rows={6}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rejection Email Template */}
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm">Rejection Email Template</div>
                        <div className="text-xs text-neutral-600 mt-1">
                          Sent to users when their registration is rejected
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendTestEmail('Rejection Email')}
                        className="px-3 py-1 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Test Email
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1">Subject Line</label>
                        <input
                          type="text"
                          value={emailTemplates.rejectionSubject}
                          onChange={(e) => setEmailTemplates({ 
                            ...emailTemplates, 
                            rejectionSubject: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Email Body</label>
                        <textarea
                          value={emailTemplates.rejectionBody}
                          onChange={(e) => setEmailTemplates({ 
                            ...emailTemplates, 
                            rejectionBody: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                          rows={6}
                        />
                        <div className="text-xs text-neutral-500 mt-1">
                          Available variables: {'{{'} name {'}}'}, {'{{'} email {'}}'}, {'{{'} platform {'}}'}, {'{{'} reason {'}}'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 mt-6">
                  <button
                    onClick={handleSaveEmailTemplates}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Email Templates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Registrations Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {/* Filters and Refresh */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Filter className="w-4 h-4 text-neutral-600" />
                  
                  {/* UserType Filter */}
                  <select
                    value={filterUserType}
                    onChange={(e) => setFilterUserType(e.target.value as UserTypeFilter)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="All">All User Types</option>
                    {availableUserTypes.map(userType => (
                      <option key={userType} value={userType}>{getUserTypeLabel(userType)}</option>
                    ))}
                    {/* Fallback options if no users loaded yet */}
                    {availableUserTypes.length === 0 && (
                      <>
                        <option value="ADMIN">ADMIN</option>
                        <option value="B2B">MedBiz</option>
                        <option value="B2C">MedBuddy</option>
                        <option value="EXECUTIVE">EXECUTIVE</option>
                        <option value="WAREHOUSE">WAREHOUSE</option>
                      </>
                    )}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh user list"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Refresh
                    </>
                  )}
                </button>
              </div>

              {/* Loading state */}
              {loading && registrations.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Loader2 className="w-12 h-12 mx-auto mb-3 opacity-50 animate-spin" />
                  <p>Loading users...</p>
                </div>
              ) : (
                <>
                  {/* Results summary */}
                  {registrations.length > 0 && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      Showing {filteredRegistrations.length} of {registrations.length} users
                      {(filterUserType !== 'All' || filterStatus !== 'All') && (
                        <span className="ml-2">
                          (Filtered by: {filterUserType !== 'All' ? `UserType: ${filterUserType}` : ''} 
                          {filterUserType !== 'All' && filterStatus !== 'All' ? ', ' : ''}
                          {filterStatus !== 'All' ? `Status: ${filterStatus}` : ''})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Registrations List */}
                  {filteredRegistrations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm text-neutral-600">Name</th>
                            <th className="text-left px-4 py-3 text-sm text-neutral-600">Email</th>
                            <th className="text-left px-4 py-3 text-sm text-neutral-600">Phone</th>
                            <th className="text-left px-4 py-3 text-sm text-neutral-600">User Type</th>
                            <th className="text-left px-4 py-3 text-sm text-neutral-600">Business Info</th>
                            <th className="text-left px-4 py-3 text-sm text-neutral-600">Registration Date</th>
                            <th className="text-left px-4 py-3 text-sm text-neutral-600">Status</th>
                            <th className="text-left px-4 py-3 text-sm text-neutral-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRegistrations.map((reg) => (
                            <tr key={reg.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                              <td className="px-4 py-4">{reg.name}</td>
                              <td className="px-4 py-4 text-neutral-600 text-sm">{reg.email}</td>
                              <td className="px-4 py-4 text-neutral-600 text-sm">{reg.phone}</td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {reg.userTypes && reg.userTypes.length > 0 ? (
                                    reg.userTypes.map((userType, idx) => {
                                      const colorMap: Record<string, string> = {
                                        'ADMIN': 'bg-red-100 text-red-700',
                                        'B2B': 'bg-purple-100 text-purple-700',
                                        'B2C': 'bg-blue-100 text-blue-700',
                                        'EXECUTIVE': 'bg-green-100 text-green-700',
                                        'WAREHOUSE': 'bg-orange-100 text-orange-700',
                                      };
                                      const colorClass = colorMap[userType.toUpperCase()] || 'bg-gray-100 text-gray-700';
                                      
                                      return (
                                        <span 
                                          key={idx}
                                          className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}
                                          title={reg.platform ? `Platform: ${reg.platform}` : ''}
                                        >
                                          {getUserTypeLabel(userType)}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                                      N/A
                                    </span>
                                  )}
                                </div>
                                {reg.platform && (
                                  <div className="text-xs text-neutral-400 mt-1">
                                    Platform: {reg.platform}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm">
                                {reg.businessName ? (
                                  <div>
                                    <div className="text-neutral-900">{reg.businessName}</div>
                                    {reg.licenseNumber && (
                                      <div className="text-xs text-neutral-500">License: {reg.licenseNumber}</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-neutral-400">Individual</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-neutral-600 text-sm">{reg.registrationDate}</td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  reg.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                  reg.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                  reg.status === 'Suspended' ? 'bg-orange-100 text-orange-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {reg.status}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                {reg.status === 'Pending' ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleApproveUser(reg.id)}
                                      disabled={loading}
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <CheckCircle className="w-3 h-3" />
                                      )}
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectUser(reg.id)}
                                      disabled={loading}
                                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <XCircle className="w-3 h-3" />
                                      )}
                                      Reject
                                    </button>
                                  </div>
                                ) : reg.status === 'Approved' ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSuspendUser(reg.id)}
                                      disabled={loading}
                                      className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Ban className="w-3 h-3" />
                                      )}
                                      Suspend
                                    </button>
                                    <button
                                      onClick={() => handleRejectUser(reg.id)}
                                      disabled={loading}
                                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <XCircle className="w-3 h-3" />
                                      )}
                                      Reject
                                    </button>
                                  </div>
                                ) : reg.status === 'Suspended' || reg.status === 'Rejected' ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleActivateUser(reg.id)}
                                      disabled={loading}
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <PlayCircle className="w-3 h-3" />
                                      )}
                                      Activate
                                    </button>
                                    {reg.status === 'Suspended' && (
                                      <button
                                        onClick={() => handleRejectUser(reg.id)}
                                        disabled={loading}
                                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {loading ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <XCircle className="w-3 h-3" />
                                        )}
                                        Reject
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-neutral-400 text-sm">No action</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-500">
                      <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium mb-1">
                        {registrations.length === 0
                          ? 'No users found in the database'
                          : `No users found matching the selected filters`}
                      </p>
                      {registrations.length === 0 && (
                        <p className="text-sm text-neutral-400 mt-1">
                          Users will appear here once they register through the signup endpoint.
                        </p>
                      )}
                      {registrations.length > 0 && (filterUserType !== 'All' || filterStatus !== 'All') && (
                        <button
                          onClick={() => {
                            setFilterUserType('All');
                            setFilterStatus('All');
                          }}
                          className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
