import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState(null);

  useEffect(() => {
    fetchSummary();
    fetchDailyAnalytics();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/analytics/summary');
      setSummary(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    }
  };

  const fetchDailyAnalytics = async () => {
    try {
      const response = await api.get('/analytics/daily');
      setDailyData(response.data);
      console.log('Daily Analytics Data:', response.data);
    } catch (error) {
      console.error('Failed to fetch daily analytics:', error);
      toast.error('Failed to fetch daily analytics');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#4ECDC4'];

  // Create order status data, filtering out zero values
  const orderStatusData = dailyData?.orderStatusBreakdown ? [
    { name: 'Pending', value: dailyData.orderStatusBreakdown.pending || 0 },
    { name: 'Confirmed', value: dailyData.orderStatusBreakdown.confirmed || 0 },
    { name: 'Preparing', value: dailyData.orderStatusBreakdown.preparing || 0 },
    { name: 'Ready', value: dailyData.orderStatusBreakdown.ready || 0 },
    { name: 'Delivered', value: dailyData.orderStatusBreakdown.delivered || 0 },
    { name: 'Completed', value: dailyData.orderStatusBreakdown.completed || 0 },
    { name: 'Cancelled', value: dailyData.orderStatusBreakdown.cancelled || 0 },
  ].filter(item => item.value > 0) : [];

  return (
    <div>
      <h2>Analytics & Reports</h2>
      
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div className="card">
            <h3>Today</h3>
            <p>Orders: {summary.today.orders}</p>
            <p>Revenue: ${summary.today.revenue.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Yesterday</h3>
            <p>Orders: {summary.yesterday.orders}</p>
            <p>Revenue: ${summary.yesterday.revenue.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>This Week</h3>
            <p>Orders: {summary.thisWeek.orders}</p>
            <p>Revenue: ${summary.thisWeek.revenue.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>This Month</h3>
            <p>Orders: {summary.thisMonth.orders}</p>
            <p>Revenue: ${summary.thisMonth.revenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {dailyData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <h3>Order Status Breakdown</h3>
            {orderStatusData.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value}`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  {orderStatusData.map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: COLORS[index % COLORS.length],
                        borderRadius: '2px'
                      }}></div>
                      <span style={{ fontSize: '12px' }}>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '48px' }}>📊</div>
                <p style={{ margin: 0, fontWeight: '500' }}>No order data available</p>
                <p style={{ fontSize: '14px', margin: 0 }}>Orders will appear here once they are created</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3>Daily Statistics</h3>
            <p>Total Orders: {dailyData.totalOrders}</p>
            <p>Total Revenue: ${dailyData.totalRevenue?.toFixed(2)}</p>
            <p>Total Customers: {dailyData.totalCustomers}</p>
            <p>Average Order Value: ${dailyData.averageOrderValue?.toFixed(2)}</p>
            <h4 style={{ marginTop: '20px' }}>Reservations</h4>
            <p>Total: {dailyData.reservationStats?.total}</p>
            <p>Confirmed: {dailyData.reservationStats?.confirmed}</p>
            <p>Completed: {dailyData.reservationStats?.completed}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;

