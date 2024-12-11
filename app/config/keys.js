module.exports = {
    email: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phone: process.env.TWILIO_PHONE_NUMBER,
    },
  };