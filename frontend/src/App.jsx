import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Invoice from './pages/Invoice';
import Vehicles from './pages/Vehicles';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import NewBooking from './pages/NewBooking';
import Payment from './pages/Payment';
import AdminReviews from './pages/AdminReviews';
import AdminTickets from './pages/AdminTickets';
import CustomerTickets from './pages/CustomerTickets';
import AdminSms from './pages/AdminSms';
import AuditLogs from './pages/AuditLogs';
import BranchManagement from './pages/BranchManagement';
import DamageReporting from './pages/DamageReporting';
import ExecutiveDashboard from './pages/ExecutiveDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div id="appShell">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/newbooking" element={<NewBooking />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/invoice/:id" element={<Invoice />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/sms" element={<AdminSms />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/branches" element={<BranchManagement />} />
            <Route path="/admin/damage-reports" element={<DamageReporting />} />
            <Route path="/admin/executive" element={<ExecutiveDashboard />} />
            <Route path="/tickets" element={<CustomerTickets />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
