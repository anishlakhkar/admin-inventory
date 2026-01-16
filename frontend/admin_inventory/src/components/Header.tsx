import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../sevices/authService";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load user email and types from localStorage
    const email = localStorage.getItem('userEmail');
    const typesStr = localStorage.getItem('userTypes');
    
    if (email) {
      setUserEmail(email);
    }
    
    if (typesStr) {
      try {
        const types = JSON.parse(typesStr);
        setUserTypes(Array.isArray(types) ? types : []);
      } catch (e) {
        console.error('Error parsing userTypes:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    // Clear user data from localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userTypes');
    navigate('/login');
  };

  const handleSearchClick = () => {
    // Navigate to Product Inventory page when search bar is clicked
    navigate('/inventory/products');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to Product Inventory with search query
      navigate(`/inventory/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (e.key === 'Enter') {
      // If Enter pressed without query, just navigate to the page
      navigate('/inventory/products');
    }
  };

  // Get user role display name
  const getUserRoleDisplay = () => {
    if (userTypes.length === 0) return 'User';
    // Return the first user type, or 'Admin' if ADMIN exists
    if (userTypes.includes('ADMIN')) return 'Admin';
    if (userTypes.includes('EXECUTIVE')) return 'Executive';
    if (userTypes.includes('B2B')) return 'B2B User';
    if (userTypes.includes('B2C')) return 'B2C User';
    return userTypes[0] || 'User';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#461E96] border-b border-[#3a1880] z-50">
      <div className="h-full flex items-center px-6 gap-6">
        {/* Logo */}
        <Link to="/" className="text-white mr-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#461E96]">
              BW
            </div>
            <span className="hidden md:block text-white">
              BluWall Drugs
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
          <Link
            to="/dashboard"
            className="text-white/80 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/inventory/products"
            className="text-white/80 hover:text-white transition-colors"
          >
            Inventory
          </Link>
        </nav>

        {/* Search Bar - Extended */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products, SKU"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchClick}
              onClick={handleSearchClick}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-white/20 bg-white/10 text-white placeholder:text-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent cursor-pointer"
            />
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
          <Bell className="w-5 h-5 text-white" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {userEmail && (
              <span className="hidden md:block text-white text-sm font-medium max-w-[200px] truncate">
                {userEmail}
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-white" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-neutral-200">
                <div className="text-sm font-medium text-neutral-900">
                  {getUserRoleDisplay()}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {userEmail || 'No email'}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}