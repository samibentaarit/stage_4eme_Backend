const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authJwt } = require("../middlewares");

// Create a new class
router.post('/',  classController.createClass);

// Get all classes
router.get('/',  classController.getAllClasses);

// Get a single class by ID
router.get('/:id', [authJwt.verifyToken], classController.getClassById);

// Update a class by ID
router.put('/:id'   , classController.updateClassById);

// Delete a class by ID
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], classController.deleteClassById);

// Get students in a class
router.get('/:classId/students', [authJwt.verifyToken], classController.getStudentsInClass);

// Assign students to a class
router.post('/:classId/students',  classController.assignStudentsToClass);

module.exports = router;
