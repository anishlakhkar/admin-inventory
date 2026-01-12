import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Download,
  FileBarChart,
  FileCheck,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Trash2,
  UserCheck,
  Zap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  const menuSections = [
    {
      title: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Inventory Setup',
      items: [
        { path: '/inventory/catalog', label: 'Catalog Management', icon: BookOpen },
        { path: '/inventory/products', label: 'Product Inventory', icon: Package },
        { path: '/inventory/remove-product', label: 'Remove Product', icon: Trash2 },
        // { path: '/inventory/auto-po', label: 'Auto PO', icon: Zap }
      ]
    },
    {
      title: 'Monitoring & Alerts',
      items: [
        { path: '/monitoring/stock-levels', label: 'View Stock Levels', icon: BarChart3 },
        { path: '/monitoring/low-stock-alerts', label: 'Low Stock Alerts', icon: AlertTriangle },
        { path: '/monitoring/expiry-tracking', label: 'Expiry Tracking', icon: Calendar }
      ]
    },
    {
      title: 'Compliance',
      items: [
        { path: '/compliance/validate-prescription', label: 'Validate Prescription (MedBuddy)', icon: FileCheck },
        { path: '/compliance/check-docs', label: 'Check Regulatory Docs (MedBiz)', icon: ClipboardCheck }
      ]
    },
    {
      title: 'Order Processing',
      items: [
        { path: '/orders/received', label: 'Orders Received', icon: ShoppingCart },
        { path: '/orders/approvals', label: 'Approvals', icon: CheckSquare },
        { path: '/orders/payment-terms', label: 'Payment Terms', icon: CreditCard },
        { path: '/orders/support-tickets', label: 'Support Tickets', icon: MessageSquare }
      ]
    },
    {
      title: 'Reports & Analytics',
      items: [
        { path: '/reports/generate', label: 'Generate Reports', icon: FileBarChart },
        { path: '/reports/export', label: 'Export Data', icon: Download }
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/settings', label: 'Settings', icon: Settings },
        { path: '/user-approval', label: 'User Approval', icon: UserCheck }
      ]
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-neutral-200 transition-all duration-300 overflow-y-auto ${collapsed ? 'w-17' : 'w-64'}`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Menu */}
      <nav className="p-4">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <div className="text-xs text-neutral-500 mb-2 px-3">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-[#461E96]/10 text-[#461E96]' 
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}