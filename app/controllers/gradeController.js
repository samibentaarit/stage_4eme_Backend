const Grade = require('../models/grade'); // Import the Grade model
const User = require('../models/user.model.js');  // Import User model

// Create a new grade
exports.createGrade = async (req, res) => {
  try {
    const { gradeName } = req.body;
    const grade = new Grade({ gradeName });
    await grade.save();
    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all grades
exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find();
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single grade by its ID
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.status(200).json(grade);
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a grade by its ID
exports.updateGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { gradeName } = req.body;

    const grade = await Grade.findByIdAndUpdate(id, { gradeName }, { new: true });
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a grade by its ID
exports.deleteGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const grade = await Grade.findByIdAndDelete(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Assign students to a grade
exports.assignStudentsToGrade = async (req, res) => {
  try {
    const { gradeId, studentIds } = req.body;

    // Find the grade by its ID
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Find the students by their IDs
    const students = await User.find({ _id: { $in: studentIds }, isStudent: true });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ message: 'Some students not found' });
    }

    // Assign the students to the grade
    grade.students.push(...students.map(student => student._id));
    await grade.save();

    // Optionally, you can also update the students to reference the grade (bidirectional relationship)
    await User.updateMany({ _id: { $in: studentIds } }, { $set: { grade: grade._id } });

    res.status(200).json({ message: 'Students assigned to grade successfully', grade });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all students in a specific grade
exports.getStudentsInGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;

    const grade = await Grade.findById(gradeId).populate('students', 'username email');
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.status(200).json(grade.students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
