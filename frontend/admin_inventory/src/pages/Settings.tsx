import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Users, Shield, Bell, Database, Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { userApprovalService, type UserResponse } from '../sevices/userApprovalService';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  
  // General Settings state (for admin user info)
  const [generalSettings, setGeneralSettings] = useState({
    platformInfo: '',
    email: '',
    phone: '',
    businessInfo: ''
  });
  const [adminUser, setAdminUser] = useState<UserResponse | null>(null);
  const [generalLoading, setGeneralLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockEmail: true,
    expiryEmail: true,
    poApprovalEmail: true,
    systemUpdates: false,
    weeklyReports: true
  });

  // User management state
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  // Form state for Add User
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNo: '',
    platform: '',
    businessInfo: '',
    userTypes: [] as string[]
  });

  // Form state for Edit User
  const [editUser, setEditUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNo: '',
    platform: '',
    businessInfo: '',
    accountStatus: 'ACTIVE' as 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED',
    userTypes: [] as string[]
  });

  // Fetch active users on component mount and when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchActiveUsers();
    }
  }, [activeTab]);

  // Fetch admin user info when general tab is active
  useEffect(() => {
    if (activeTab === 'general') {
      fetchAdminUserInfo();
    }
  }, [activeTab]);

  const fetchAdminUserInfo = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Admin user ID not found. Please login again.');
      return;
    }

    setGeneralLoading(true);
    setError(null);
    try {
      const user = await userApprovalService.getUserByIdRaw(parseInt(userId));
      setAdminUser(user);
      setGeneralSettings({
        platformInfo: user.platform || '',
        email: user.email || '',
        phone: user.phoneNo || '',
        businessInfo: user.businessInfo || ''
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch admin user info';
      setError(errorMessage);
      console.error('Error fetching admin user info:', err);
    } finally {
      setGeneralLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeUsers = await userApprovalService.getActiveUsers();
      setUsers(activeUsers);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching active users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || !adminUser) {
      setError('Admin user ID not found. Please login again.');
      return;
    }

    // Verify user is admin
    const userTypesStr = localStorage.getItem('userTypes');
    if (!userTypesStr) {
      setError('User role not found. Only admins can update general settings.');
      return;
    }

    try {
      const userTypes: string[] = JSON.parse(userTypesStr);
      if (!userTypes.includes('ADMIN')) {
        setError('Access denied. Only administrators can update general settings.');
        return;
      }
    } catch (e) {
      setError('Invalid user role. Only admins can update general settings.');
      return;
    }

    setGeneralLoading(true);
    setError(null);
    try {
      await userApprovalService.updateUser(adminUser.id, {
        platform: generalSettings.platformInfo,
        phoneNo: generalSettings.phone,
        businessInfo: generalSettings.businessInfo
      });
      
      // Refresh admin user info after update
      await fetchAdminUserInfo();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update general settings';
      setError(errorMessage);
      console.error('Error updating general settings:', err);
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    console.log('Saving notification settings:', notificationSettings);
    setError(null);
  };

  // User management handlers
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || newUser.userTypes.length === 0) {
      setError('Please fill in all required fields (email, password, and at least one role)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await userApprovalService.createUser(newUser);
      setShowAddModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNo: '',
        platform: '',
        businessInfo: '',
        userTypes: []
      });
      await fetchActiveUsers(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create user';
      setError(errorMessage);
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError(null);
    try {
      await userApprovalService.updateUser(editingUser.id, editUser);
      setShowEditModal(false);
      setEditingUser(null);
      await fetchActiveUsers(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update user';
      setError(errorMessage);
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingUserId(id);
    setError(null);
    try {
      await userApprovalService.deleteUser(id);
      await fetchActiveUsers(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete user';
      setError(errorMessage);
      console.error('Error deleting user:', err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const openEditModal = (user: UserResponse) => {
    setEditingUser(user);
    setEditUser({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNo: user.phoneNo || '',
      platform: user.platform || '',
      businessInfo: user.businessInfo || '',
      accountStatus: user.accountStatus,
      userTypes: user.userTypes || []
    });
    setShowEditModal(true);
  };

  const toggleUserType = (type: string, isNew: boolean = true) => {
    if (isNew) {
      setNewUser(prev => ({
        ...prev,
        userTypes: prev.userTypes.includes(type)
          ? prev.userTypes.filter(t => t !== type)
          : [...prev.userTypes, type]
      }));
    } else {
      setEditUser(prev => ({
        ...prev,
        userTypes: prev.userTypes.includes(type)
          ? prev.userTypes.filter(t => t !== type)
          : [...prev.userTypes, type]
      }));
    }
  };

  // Helper function to map user type to display label
  const getUserTypeLabel = (userType: string): string => {
    switch (userType.toUpperCase()) {
      case 'B2C': return 'MedBuddy';
      case 'B2B': return 'MedBiz';
      default: return userType;
    }
  };

  const getUserRoleDisplay = (userTypes: string[]) => {
    if (!userTypes || userTypes.length === 0) return 'No Role';
    return userTypes.map(type => getUserTypeLabel(type)).join(', ');
  };

  const getRoleColor = (userType: string) => {
    const colorMap: Record<string, string> = {
      'ADMIN': 'bg-purple-100 text-purple-700',
      'B2B': 'bg-blue-100 text-blue-700',
      'B2C': 'bg-green-100 text-green-700',
      'EXECUTIVE': 'bg-orange-100 text-orange-700',
      'WAREHOUSE': 'bg-yellow-100 text-yellow-700',
    };
    return colorMap[userType.toUpperCase()] || 'bg-neutral-100 text-neutral-700';
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Backup', icon: Database }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-neutral-600 mt-1">Configure system preferences and user management</p>
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
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
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4">Admin Information</h2>
                <p className="text-sm text-neutral-600 mb-4">Update your admin account information (Admin only)</p>
                
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                    <p className="font-medium">Error:</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                )}

                {generalLoading && !adminUser ? (
                  <div className="text-center py-12 text-neutral-500">
                    <Loader2 className="w-12 h-12 mx-auto mb-3 opacity-50 animate-spin" />
                    <p>Loading admin information...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Platform Info</label>
                      <input
                        type="text"
                        value={generalSettings.platformInfo}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, platformInfo: e.target.value })}
                        placeholder="Enter platform information"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Email</label>
                      <input
                        type="email"
                        value={generalSettings.email}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Phone</label>
                      <input
                        type="tel"
                        value={generalSettings.phone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm mb-2">Business Info</label>
                      <textarea
                        value={generalSettings.businessInfo}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, businessInfo: e.target.value })}
                        placeholder="Enter business information"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <button
                  onClick={handleSaveGeneral}
                  disabled={generalLoading || !adminUser}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Users & Roles */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2>User Management</h2>
                  <p className="text-sm text-neutral-600 mt-1">Manage active users and their roles</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New User
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <p className="font-medium">Error:</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {loading && users.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Loader2 className="w-12 h-12 mx-auto mb-3 opacity-50 animate-spin" />
                  <p>Loading users...</p>
                </div>
              ) : (
                <>
                  {/* Users Table */}
                  {users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="text-left px-6 py-3 text-sm text-neutral-600">Name</th>
                            <th className="text-left px-6 py-3 text-sm text-neutral-600">Email</th>
                            <th className="text-left px-6 py-3 text-sm text-neutral-600">Phone</th>
                            <th className="text-left px-6 py-3 text-sm text-neutral-600">Roles</th>
                            <th className="text-left px-6 py-3 text-sm text-neutral-600">Status</th>
                            <th className="text-left px-6 py-3 text-sm text-neutral-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => {
                            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
                            return (
                              <tr key={user.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                                <td className="px-6 py-4">{fullName}</td>
                                <td className="px-6 py-4 text-neutral-600">{user.email}</td>
                                <td className="px-6 py-4 text-neutral-600 text-sm">{user.phoneNo || 'N/A'}</td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {user.userTypes && user.userTypes.length > 0 ? (
                                      user.userTypes.map((userType, idx) => (
                                        <span
                                          key={idx}
                                          className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(userType)}`}
                                        >
                                          {getUserTypeLabel(userType)}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="px-2 py-1 rounded text-xs bg-neutral-100 text-neutral-500">
                                        No Role
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                    user.accountStatus === 'SUSPENDED' ? 'bg-orange-100 text-orange-700' :
                                    user.accountStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {user.accountStatus.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => openEditModal(user)}
                                      className="text-blue-600 hover:text-blue-700 hover:underline text-sm flex items-center gap-1"
                                      disabled={loading}
                                    >
                                      <Edit className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-red-600 hover:text-red-700 hover:underline text-sm flex items-center gap-1"
                                      disabled={loading || deletingUserId === user.id}
                                    >
                                      {deletingUserId === user.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3 h-3" />
                                      )}
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium mb-1">No active users found</p>
                      <p className="text-sm text-neutral-400 mt-1">Add a new user to get started</p>
                    </div>
                  )}
                </>
              )}

              {/* Add User Modal */}
              {showAddModal && (
                <div 
                  className="fixed inset-0 flex items-center justify-center z-50"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Add New User</h3>
                      <button
                        onClick={() => {
                          setShowAddModal(false);
                          setError(null);
                          setNewUser({
                            email: '',
                            password: '',
                            firstName: '',
                            lastName: '',
                            phoneNo: '',
                            platform: '',
                            businessInfo: '',
                            userTypes: []
                          });
                        }}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Password *</label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">First Name</label>
                          <input
                            type="text"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Last Name</label>
                          <input
                            type="text"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Phone</label>
                          <input
                            type="tel"
                            value={newUser.phoneNo}
                            onChange={(e) => setNewUser({ ...newUser, phoneNo: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Platform</label>
                          <input
                            type="text"
                            value={newUser.platform}
                            onChange={(e) => setNewUser({ ...newUser, platform: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm mb-1">Business Info</label>
                        <textarea
                          value={newUser.businessInfo}
                          onChange={(e) => setNewUser({ ...newUser, businessInfo: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-2">Roles *</label>
                        <div className="flex flex-wrap gap-2">
                          {['ADMIN', 'B2B', 'B2C', 'EXECUTIVE', 'WAREHOUSE'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleUserType(type, true)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                newUser.userTypes.includes(type)
                                  ? getRoleColor(type) + ' ring-2 ring-blue-500'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {getUserTypeLabel(type)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Create User
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            setError(null);
                            setNewUser({
                              email: '',
                              password: '',
                              firstName: '',
                              lastName: '',
                              phoneNo: '',
                              platform: '',
                              businessInfo: '',
                              userTypes: []
                            });
                          }}
                          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit User Modal */}
              {showEditModal && editingUser && (
                <div 
                  className="fixed inset-0 flex items-center justify-center z-50"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Edit User</h3>
                      <button
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingUser(null);
                          setError(null);
                        }}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleEditUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            value={editUser.email}
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Account Status</label>
                          <select
                            value={editUser.accountStatus}
                            onChange={(e) => setEditUser({ ...editUser, accountStatus: e.target.value as any })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="PENDING_APPROVAL">Pending Approval</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Phone</label>
                          <input
                            type="tel"
                            value={editUser.phoneNo}
                            onChange={(e) => setEditUser({ ...editUser, phoneNo: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Platform</label>
                          <input
                            type="text"
                            value={editUser.platform}
                            onChange={(e) => setEditUser({ ...editUser, platform: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm mb-1">Business Info</label>
                        <textarea
                          value={editUser.businessInfo}
                          onChange={(e) => setEditUser({ ...editUser, businessInfo: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-2">Roles *</label>
                        <div className="flex flex-wrap gap-2">
                          {['ADMIN', 'B2B', 'B2C', 'EXECUTIVE', 'WAREHOUSE'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleUserType(type, false)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                editUser.userTypes.includes(type)
                                  ? getRoleColor(type) + ' ring-2 ring-blue-500'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {getUserTypeLabel(type)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <button
                          type="submit"
                          disabled={loading || editUser.userTypes.length === 0}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingUser(null);
                            setError(null);
                          }}
                          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2>Notification Preferences</h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <div className="text-sm">Low Stock Alerts</div>
                    <div className="text-xs text-neutral-600 mt-1">Receive emails when stock falls below threshold</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.lowStockEmail}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockEmail: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <div className="text-sm">Expiry Notifications</div>
                    <div className="text-xs text-neutral-600 mt-1">Get notified about upcoming product expiries</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.expiryEmail}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, expiryEmail: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <div className="text-sm">PO Approval Requests</div>
                    <div className="text-xs text-neutral-600 mt-1">Email notifications for pending approvals</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.poApprovalEmail}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, poApprovalEmail: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <div className="text-sm">Weekly Reports</div>
                    <div className="text-xs text-neutral-600 mt-1">Receive weekly inventory summary reports</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.weeklyReports}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <div className="text-sm">System Updates</div>
                    <div className="text-xs text-neutral-600 mt-1">Notifications about system maintenance and updates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.systemUpdates}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, systemUpdates: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <button
                  onClick={handleSaveNotifications}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2>Security Settings</h2>

              <div className="space-y-4">
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="text-sm mb-2">Password Policy</div>
                  <div className="text-xs text-neutral-600 mb-3">Minimum password length: 8 characters</div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Change Password
                  </button>
                </div>

                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="text-sm mb-2">Two-Factor Authentication</div>
                  <div className="text-xs text-neutral-600 mb-3">Add an extra layer of security to your account</div>
                  <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                    Enable 2FA
                  </button>
                </div>

                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="text-sm mb-2">Session Timeout</div>
                  <div className="text-xs text-neutral-600 mb-3">Automatically log out after period of inactivity</div>
                  <select className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Data & Backup */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2>Data Management</h2>

              <div className="space-y-4">
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="text-sm mb-2">Database Backup</div>
                  <div className="text-xs text-neutral-600 mb-3">Last backup: December 10, 2024 at 2:00 AM</div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Backup Now
                    </button>
                    <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                      Schedule Backups
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="text-sm mb-2">Data Export</div>
                  <div className="text-xs text-neutral-600 mb-3">Export all system data for archival or migration</div>
                  <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                    Export All Data
                  </button>
                </div>

                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="text-sm mb-2 text-red-900">Danger Zone</div>
                  <div className="text-xs text-red-700 mb-3">Irreversible actions that affect your data</div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    Delete All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
