import Notification from '../models/Notification.js';
import twilio from 'twilio';

// Lazy initialization of Twilio client - only create if credentials are available
let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
};

export const createNotification = async (userId, title, message, type, link = null, metadata = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      metadata
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const sendSMS = async (phoneNumber, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Twilio not configured, skipping SMS');
      return;
    }

    const client = getTwilioClient();
    if (!client) {
      console.log('Twilio client not available, skipping SMS');
      return;
    }

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  // This would integrate with FCM (Firebase Cloud Messaging)
  // For now, we'll just log it
  console.log('Push notification:', { fcmToken, title, body, data });
  // In production, integrate with FCM or similar service
};

