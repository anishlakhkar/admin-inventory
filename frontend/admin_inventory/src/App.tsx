import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CheckDocs from './pages/compliance/CheckDocs';
import ValidatePrescription from './pages/compliance/ValidatePrescription';
import Dashboard from './pages/Dashboard';
import CatalogManagement from './pages/inventory/CatalogManagement';
import ProductInventory from './pages/inventory/ProductInventory';
import RemoveProduct from './pages/inventory/RemoveProduct';
import Login from './pages/Login';
import ExpiryTracking from './pages/monitoring/ExpiryTracking';
import LowStockAlerts from './pages/monitoring/LowStockAlerts';
import StockLevels from './pages/monitoring/StockLevels';
import Approvals from './pages/orders/Approvals';
import OrderReceived from './pages/orders/OrderReceived';
import PaymentTerms from './pages/orders/PaymentTerms';
import SupportReturns from './pages/orders/SupportTickets';
import ExportData from './pages/reports/ExportData';
import GenerateReports from './pages/reports/GenerateReports';
import Settings from './pages/Settings';
import UserApproval from './pages/UserApproval';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route - No Layout */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - With Layout (Admin Only) */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        {/* Redirect old routes to new merged page */}
        <Route path="/inventory/add-product" element={<Navigate to="/inventory/catalog" replace />} />
        <Route path="/inventory/view-product" element={<Navigate to="/inventory/products" replace />} />
        <Route path="/inventory/update-stock" element={<Navigate to="/inventory/products" replace />} />
        <Route path="/inventory/auto-po" element={<Navigate to="/inventory/products" replace />} />
        {/* Redirect old support tickets route */}
        <Route path="/orders/support-tickets" element={<Navigate to="/support-returns" replace />} />
        <Route path="/inventory/catalog" element={
          <ProtectedRoute>
            <Layout><CatalogManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/inventory/products" element={
          <ProtectedRoute>
            <Layout><ProductInventory /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/inventory/remove-product" element={
          <ProtectedRoute>
            <Layout><RemoveProduct /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/monitoring/stock-levels" element={
          <ProtectedRoute>
            <Layout><StockLevels /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/monitoring/low-stock-alerts" element={
          <ProtectedRoute>
            <Layout><LowStockAlerts /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/monitoring/expiry-tracking" element={
          <ProtectedRoute>
            <Layout><ExpiryTracking /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/compliance/validate-prescription" element={
          <ProtectedRoute>
            <Layout><ValidatePrescription /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/compliance/check-docs" element={
          <ProtectedRoute>
            <Layout><CheckDocs /></Layout>
          </ProtectedRoute>
        } />
        {/* <Route path="/orders/received" element={<Layout><OrderReceived /></Layout>} /> */}
        <Route path="/orders/received" element={
          <ProtectedRoute>
            <Layout><OrderReceived /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders/approvals" element={
          <ProtectedRoute>
            <Layout><Approvals /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders/payment-terms" element={
          <ProtectedRoute>
            <Layout><PaymentTerms /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/generate" element={
          <ProtectedRoute>
            <Layout><GenerateReports /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/export" element={
          <ProtectedRoute>
            <Layout><ExportData /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/user-approval" element={
          <ProtectedRoute>
            <Layout><UserApproval /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/support-returns" element={
          <ProtectedRoute>
            <Layout><SupportReturns /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}