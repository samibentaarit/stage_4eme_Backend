const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController'); // Path to your controller
const { authJwt } = require("../middlewares");

// Create a new grade
router.post('/',  gradeController.createGrade);

// Assign students to a grade
router.post('/assign', gradeController.assignStudentsToGrade);

// Get all students in a specific grade
router.get('/:gradeId/students', gradeController.getStudentsInGrade);

// Get all grades
router.get('/',  gradeController.getAllGrades);

// Get a single grade by ID
router.get('/:id',  gradeController.getGradeById);

// Update a grade by ID
router.put('/:id',  gradeController.updateGradeById);

// Delete a grade by ID
router.delete('/:id',  gradeController.deleteGradeById);

module.exports = router;
