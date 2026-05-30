import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

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
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Authenticated routes — any logged-in user */}
            <Route path="/vehicles" element={<PrivateRoute><Vehicles /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/newbooking" element={<PrivateRoute><NewBooking /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
            <Route path="/invoice/:id" element={<PrivateRoute><Invoice /></PrivateRoute>} />
            <Route path="/tickets" element={<PrivateRoute allowedRoles={['CUSTOMER']}><CustomerTickets /></PrivateRoute>} />

            {/* Admin + Employee routes */}
            <Route path="/reports" element={<PrivateRoute allowedRoles={['ADMIN', 'EMPLOYEE']}><Reports /></PrivateRoute>} />
            <Route path="/admin/damage-reports" element={<PrivateRoute allowedRoles={['ADMIN', 'EMPLOYEE']}><DamageReporting /></PrivateRoute>} />

            {/* Admin-only routes */}
            <Route path="/users" element={<PrivateRoute allowedRoles={['ADMIN']}><Users /></PrivateRoute>} />
            <Route path="/admin/reviews" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminReviews /></PrivateRoute>} />
            <Route path="/admin/tickets" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminTickets /></PrivateRoute>} />
            <Route path="/admin/sms" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminSms /></PrivateRoute>} />
            <Route path="/admin/audit-logs" element={<PrivateRoute allowedRoles={['ADMIN']}><AuditLogs /></PrivateRoute>} />
            <Route path="/admin/branches" element={<PrivateRoute allowedRoles={['ADMIN']}><BranchManagement /></PrivateRoute>} />
            <Route path="/admin/executive" element={<PrivateRoute allowedRoles={['ADMIN']}><ExecutiveDashboard /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
