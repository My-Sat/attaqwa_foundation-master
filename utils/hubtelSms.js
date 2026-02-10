const axios = require('axios');

function normalizePhoneNumber(phoneNumberInput) {
  const raw = String(phoneNumberInput || '').trim();
  if (!raw) {
    return '';
  }

  const digitsOnly = raw.replace(/\D/g, '');

  if (digitsOnly.startsWith('233') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    return `+233${digitsOnly.slice(1)}`;
  }

  if (raw.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.length >= 10) {
    return `+${digitsOnly}`;
  }

  return raw;
}

async function sendHubtelSMS(phoneNumberInput, smsMessage) {
  const endpoint = process.env.HUBTEL_SMS_ENDPOINT || 'https://smsc.hubtel.com/v1/messages/send';
  const clientId = process.env.HUBTEL_CLIENT_ID || '';
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET || '';
  const senderId = process.env.HUBTEL_SENDER_ID || '';
  const phoneNumber = normalizePhoneNumber(phoneNumberInput);

  if (!clientId || !clientSecret || !senderId) {
    throw new Error('Hubtel SMS settings are missing.');
  }

  if (!phoneNumber) {
    throw new Error('Recipient phone number is missing.');
  }

  const requestPayload = {
    clientid: clientId,
    clientsecret: clientSecret,
    from: senderId,
    to: phoneNumber,
    content: smsMessage,
  };

  try {
    await axios.get(endpoint, {
      params: requestPayload,
      timeout: 15000,
    });
  } catch (getError) {
    await axios.post(endpoint, requestPayload, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

module.exports = {
  normalizePhoneNumber,
  sendHubtelSMS,
};
