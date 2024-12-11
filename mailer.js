const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

require('dotenv').config(); // Load environment variables from .env file

// Configure your email transport
const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can use any email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password
  }
});

// Function to send email with an optional attachment
const sendEmail = (to, subject, text, filePath) => {
  // Prepare email options
  const mailOptions = {
    from: 'sbentaarit@gmail.com',
    to: to,
    subject: subject,
    text: text,
    attachments: []
  };

  // Check if filePath is provided and add it as an attachment
  if (filePath) {
    const fileContent = fs.readFileSync(filePath);
    mailOptions.attachments.push({
      filename: path.basename(filePath),
      content: fileContent,
      contentType: 'image/jpeg' // Adjust the MIME type as necessary
    });
  }

  // Send the email
  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
