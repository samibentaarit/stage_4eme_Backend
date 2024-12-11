const twilio = require('twilio');
const keys = require('../config/keys');
require('dotenv').config();

const client = twilio(keys.twilio.accountSid, keys.twilio.authToken);

exports.sendSMS = (to, message) => {
  return client.messages.create({
    body: message,
    from: keys.twilio.phone,
    to,
  });
};