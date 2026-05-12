import Reservation from '../models/Reservation.js';
import { createNotification, sendSMS } from '../utils/sendNotification.js';
import { emitToRole } from '../utils/socketEmitter.js';

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private
export const createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create({
      ...req.body,
      customer: req.user._id
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('customer', 'name email phone');

    // Emit socket event
    const io = req.app.get('io');
    emitToRole(io, 'admin', 'new-reservation', populatedReservation);
    emitToRole(io, 'waiter', 'new-reservation', populatedReservation);

    // Create notification
    await createNotification(
      req.user._id,
      'Reservation Created',
      `Your reservation for table ${reservation.tableNumber} has been created`,
      'reservation',
      `/reservations/${reservation._id}`
    );

    res.status(201).json(populatedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
export const getReservations = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = {};

    if (req.user.role === 'user') {
      query.customer = req.user._id;
    }

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.reservationDate = { $gte: startDate, $lte: endDate };
    }

    const reservations = await Reservation.find(query)
      .populate('customer', 'name email phone')
      .populate('assignedWaiter', 'name')
      .sort({ reservationDate: 1, reservationTime: 1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
export const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('assignedWaiter', 'name');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (req.user.role === 'user' && reservation.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = status;

    if (req.body.assignedWaiter) {
      reservation.assignedWaiter = req.body.assignedWaiter;
    }

    await reservation.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('customer', 'name email phone')
      .populate('assignedWaiter', 'name');

    // Create notification
    await createNotification(
      reservation.customer,
      'Reservation Status Updated',
      `Your reservation for table ${reservation.tableNumber} status has been updated to ${status}`,
      'reservation',
      `/reservations/${reservation._id}`
    );

    res.json(populatedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Private
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (req.user.role === 'user' && reservation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

