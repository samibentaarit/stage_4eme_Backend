const express = require('express');
const router = express.Router();
const annanceController = require('../controllers/annanceController');
const { authJwt } = require("../middlewares");

router.get('/', annanceController.getAnnancesByUserOrRole);
// Route to get annances for a specific user
router.get('/:userId', annanceController.getAnnancesForUser);

module.exports = router;