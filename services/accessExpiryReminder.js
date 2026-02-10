const Registration = require('../models/class_registration');
const Message = require('../models/messages');
const { sendHubtelSMS } = require('../utils/hubtelSms');

const DEFAULT_INTERVAL_MINUTES = 10;
let workerTimer = null;

async function processExpiringAccessReminders() {
  const now = new Date();
  const reminderWindowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const registrations = await Registration.find({
    approved: true,
    accessExpiresAt: { $gt: now, $lte: reminderWindowEnd },
    accessExpiryReminder24hSentAt: null,
  })
    .populate('userId', 'username phoneNumber')
    .populate('classSessionId', 'title')
    .sort({ accessExpiresAt: 1 })
    .limit(200);

  for (const registration of registrations) {
    const username = registration.userId && registration.userId.username
      ? registration.userId.username
      : 'Student';
    const phoneNumber = registration.userId && registration.userId.phoneNumber
      ? registration.userId.phoneNumber
      : '';
    const sessionTitle = registration.classSessionId && registration.classSessionId.title
      ? registration.classSessionId.title
      : 'Class Session';
    const expiresAtText = registration.accessExpiresAt
      ? registration.accessExpiresAt.toLocaleString()
      : 'soon';

    const smsText = `Reminder: ${username}, your access to ${sessionTitle} expires in about 24 hours (${expiresAtText}). Please renew if you want uninterrupted access.`;
    const inboxText = `Reminder: Your access to ${sessionTitle} expires in about 24 hours (${expiresAtText}). Please renew if you want uninterrupted access.`;

    let appInboxDelivered = false;
    let smsDelivered = false;

    try {
      await Message.create({
        userId: registration.userId._id,
        question: 'Session Expiry Reminder',
        answer: inboxText,
      });
      appInboxDelivered = true;
    } catch (messageError) {
      console.error(`24h expiry reminder inbox message failed for registration ${registration._id}:`, messageError.message);
    }

    try {
      await sendHubtelSMS(phoneNumber, smsText);
      smsDelivered = true;
    } catch (smsError) {
      console.error(`24h expiry reminder SMS failed for registration ${registration._id}:`, smsError.message);
    }

    if (appInboxDelivered || smsDelivered) {
      registration.accessExpiryReminder24hSentAt = new Date();
      await registration.save();
    }
  }
}

function startAccessExpiryReminderWorker() {
  if (workerTimer) {
    return;
  }

  const parsedInterval = Number(process.env.ACCESS_EXPIRY_REMINDER_INTERVAL_MINUTES);
  const intervalMinutes = Number.isFinite(parsedInterval) && parsedInterval > 0
    ? parsedInterval
    : DEFAULT_INTERVAL_MINUTES;
  const intervalMs = Math.round(intervalMinutes * 60 * 1000);

  processExpiringAccessReminders().catch((error) => {
    console.error('Initial access expiry reminder run failed:', error.message);
  });

  workerTimer = setInterval(() => {
    processExpiringAccessReminders().catch((error) => {
      console.error('Scheduled access expiry reminder run failed:', error.message);
    });
  }, intervalMs);
}

module.exports = {
  processExpiringAccessReminders,
  startAccessExpiryReminderWorker,
};
