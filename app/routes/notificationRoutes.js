const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/email', notificationController.sendEmailNotification);
router.post('/sms', notificationController.sendSMSNotification);

module.exports = router;