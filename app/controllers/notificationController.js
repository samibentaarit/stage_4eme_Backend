const { sendEmail } = require('../utils/emailService');
const { sendSMS } = require('../utils/smsService');

exports.sendEmailNotification = (req, res) => {
  const { to, subject, text } = req.body;
  sendEmail(to, subject, text)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error.toString()));
};

exports.sendSMSNotification = (req, res) => {
  const { to, message } = req.body;
  sendSMS(to, message)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error.toString()));
};