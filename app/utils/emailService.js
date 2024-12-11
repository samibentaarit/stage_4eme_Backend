const nodemailer = require('nodemailer');
const keys = require('../config/keys');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: keys.email.user,
    pass: keys.email.pass,
  },
});

exports.sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: keys.email.user,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};