import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const ExecutiveDashboard = () => {
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [branchPerf, setBranchPerf] = useState([]);
  const [customerStats, setCustomerStats] = useState({});
  const [maintenanceStats, setMaintenanceStats] = useState({});
  const [topCustomers, setTopCustomers] = useState([]);
  const [vehicleProfit, setVehicleProfit] = useState([]);
  const [supportStats, setSupportStats] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [fleetUtilization, setFleetUtilization] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    const fetchAll = async () => {
      try {
        const [
          revRes, branchRes, custRes, maintRes, 
          topCustRes, profRes, suppRes, logRes, vehRes
        ] = await Promise.all([
          api.get('/reports/revenue/monthly'),
          api.get('/reports/branches'),
          api.get('/reports/customers'),
          api.get('/reports/maintenance'),
          api.get('/reports/top-customers'),
          api.get('/reports/vehicle-profitability'),
          api.get('/reports/support'),
          api.get('/audit-logs/recent'),
          api.get('/vehicles')
        ]);

        setRevenueTrend(revRes.data);
        setBranchPerf(branchRes.data);
        setCustomerStats(custRes.data);
        setMaintenanceStats(maintRes.data);
        setTopCustomers(topCustRes.data);
        setVehicleProfit(profRes.data);
        setSupportStats(suppRes.data);
        setRecentLogs(logRes.data);

        // Compute KPIs that span multiple endpoints
        const totalRev = profRes.data.reduce((sum, v) => sum + v.revenue, 0);
        setTotalRevenue(totalRev);

        const totalVehicles = vehRes.data.length;
        const available = vehRes.data.filter(v => v.status === 'AVAILABLE').length;
        const maintenance = vehRes.data.filter(v => v.status === 'MAINTENANCE').length;
        const rented = totalVehicles - available - maintenance;
        const util = totalVehicles > 0 ? ((rented / totalVehicles) * 100).toFixed(1) : 0;
        setFleetUtilization(util);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }

  if (loading) return <div className="page active"><p>Loading executive insights...</p></div>;

  const fleetHealthData = [
    { name: 'Healthy', value: vehicleProfit.length > 0 ? (100 - (maintenanceStats.underMaintenance / vehicleProfit.length) * 100) : 100, color: '#38a169' },
    { name: 'Under Maintenance', value: vehicleProfit.length > 0 ? ((maintenanceStats.underMaintenance / vehicleProfit.length) * 100) : 0, color: '#e53e3e' }
  ];

  const supportData = [
    { name: 'Open', value: supportStats.openTickets || 0, color: '#dd6b20' },
    { name: 'Closed', value: supportStats.closedTickets || 0, color: '#3182ce' }
  ];

  return (
    <div className="page active">
      <div className="section-hdr">
        <div>
          <div className="section-title">Executive Dashboard</div>
          <div className="section-sub">High-level overview and analytics</div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff8e6' }}>💰</div>
          <div className="stat-val">${totalRevenue.toLocaleString()}</div>
          <div className="stat-lbl">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e6f0ff' }}>🚗</div>
          <div className="stat-val">{customerStats.activeCustomers || 0}</div>
          <div className="stat-lbl">Active Rentals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0e6ff' }}>🔥</div>
          <div className="stat-val">{fleetUtilization}%</div>
          <div className="stat-lbl">Fleet Utilization</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffe6e6' }}>🎫</div>
          <div className="stat-val">{supportStats.openTickets || 0}</div>
          <div className="stat-lbl">Open Tickets</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Revenue Trend Line Chart */}
        <div className="profile-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(val) => `$${val}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3182ce" strokeWidth={3} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Support Tickets Donut Chart */}
        <div className="profile-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Support Tickets</h3>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px' }}>
            Avg Resolution Time: <strong>{supportStats.averageResolutionTime}</strong><br/>
            Most Common: <strong>{supportStats.mostCommonIssue}</strong>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={supportData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={5}>
                {supportData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Branch Performance Bar Chart */}
        <div className="profile-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Branch Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchPerf}>
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip formatter={(val) => `$${val}`} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#ecc94b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Health Pie Chart */}
        <div className="profile-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Fleet Health</h3>
          <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--text2)', marginBottom: '10px' }}>
            <div>Total Cost: <strong>${maintenanceStats.maintenanceCost}</strong></div>
            <div>Repairs: <strong>{maintenanceStats.completedRepairs}</strong></div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={fleetHealthData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                {fleetHealthData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(val) => `${val.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          {/* Vehicle Profitability Table */}
          <div className="profile-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Vehicle Profitability</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Revenue</th>
                    <th>Maint. Cost</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleProfit.slice(0, 5).map((v, i) => (
                    <tr key={i}>
                      <td className="text-bold">{v.vehicle}</td>
                      <td>${v.revenue}</td>
                      <td style={{ color: '#e53e3e' }}>${v.cost}</td>
                      <td className="text-bold text-green">${v.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="profile-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '16px' }}>Top Customers</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Rentals</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr key={i}>
                      <td className="text-bold">{c.customer}</td>
                      <td>{c.rentals}</td>
                      <td className="text-bold text-green">${c.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="profile-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '16px' }}>Recent Activity Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {recentLogs.map((log, idx) => (
              <div key={idx} style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {log.username} <span style={{ color: 'var(--text3)' }}>performed</span> {log.action}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  {new Date(log.timestamp).toLocaleString()} • {log.entityName} #{log.entityId}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExecutiveDashboard;
