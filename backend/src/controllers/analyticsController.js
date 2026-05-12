import Analytics from '../models/Analytics.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Get daily analytics
// @route   GET /api/analytics/daily
// @access  Private/Admin
export const getDailyAnalytics = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const startDate = new Date(targetDate);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    // Get orders for the day
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('items.menuItem');

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order status breakdown
    const orderStatusBreakdown = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    // Popular items
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemId = item.menuItem._id.toString();
        if (!itemCounts[itemId]) {
          itemCounts[itemId] = {
            menuItem: item.menuItem._id,
            quantity: 0
          };
        }
        itemCounts[itemId].quantity += item.quantity;
      });
    });

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Get reservations
    const reservations = await Reservation.find({
      reservationDate: { $gte: startDate, $lte: endDate }
    });

    const reservationStats = {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      completed: reservations.filter(r => r.status === 'completed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length
    };

    // Unique customers
    const uniqueCustomers = new Set(orders.map(o => o.customer.toString()));
    const totalCustomers = uniqueCustomers.size;

    res.json({
      date: targetDate,
      totalOrders,
      totalRevenue,
      totalCustomers,
      averageOrderValue,
      orderStatusBreakdown,
      popularItems,
      reservationStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics for date range
// @route   GET /api/analytics/range
// @access  Private/Admin
export const getAnalyticsRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const uniqueCustomers = new Set(orders.map(o => o.customer.toString()));

    res.json({
      startDate: start,
      endDate: end,
      totalOrders,
      totalRevenue,
      totalCustomers: uniqueCustomers.size,
      averageOrderValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get performance summary
// @route   GET /api/analytics/summary
// @access  Private/Admin
export const getPerformanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    // Today's stats
    const todayOrders = await Order.find({
      createdAt: { $gte: today }
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Yesterday's stats
    const yesterdayOrders = await Order.find({
      createdAt: { $gte: yesterday, $lt: today }
    });
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // This week's stats
    const weekOrders = await Order.find({
      createdAt: { $gte: thisWeek }
    });
    const weekRevenue = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // This month's stats
    const monthOrders = await Order.find({
      createdAt: { $gte: thisMonth }
    });
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const preparingOrders = await Order.countDocuments({ status: 'preparing' });

    res.json({
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue
      },
      yesterday: {
        orders: yesterdayOrders.length,
        revenue: yesterdayRevenue
      },
      thisWeek: {
        orders: weekOrders.length,
        revenue: weekRevenue
      },
      thisMonth: {
        orders: monthOrders.length,
        revenue: monthRevenue
      },
      current: {
        pendingOrders,
        preparingOrders
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

