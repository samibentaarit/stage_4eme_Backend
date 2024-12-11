const Class = require('../models/Class');
const Grade = require('../models/grade'); 
const User = require('../models/user.model.js'); 

exports.createClass = async (req, res) => {
    try {
      const { className, gradeId } = req.body;
  
      // Create a new class
      const newClass = new Class({
        className,
        grade: gradeId
      });
  
      await newClass.save();
  
      // Add the class to the corresponding grade
      const grade = await Grade.findById(gradeId);
      grade.classes.push(newClass._id);
      await grade.save();
  
      res.status(201).json(newClass);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
exports.getStudentsInClass = async (req, res) => {
    try {
      const classObj = await Class.findById(req.params.classId).populate('students');
      res.status(200).json(classObj.students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Get all classes
exports.getAllClasses = async (req, res) => {
    try {
      const classes = await Class.find().populate('grade').populate('students');
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Get a single class by ID
exports.getClassById = async (req, res) => {
    try {
      const classObj = await Class.findById(req.params.id)
        .populate('grade')
        .populate('students');
  
      if (!classObj) {
        return res.status(404).json({ message: 'Class not found' });
      }
  
      res.status(200).json(classObj);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  //update name of class
  exports.updateClassById = async (req, res) => {
    try {
      const { className } = req.body;

      const updatedClass = await Class.findByIdAndUpdate(
        req.params.id,
        { className},
        { new: true }
      ).populate('grade').populate('students');

      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  
// Delete a class by ID
exports.deleteClassById = async (req, res) => {
    try {
      const deletedClass = await Class.findByIdAndDelete(req.params.id);
  
      if (!deletedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
  
      res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

//assign Students To Class
exports.assignStudentsToClass111 = async (req, res) => {
    try {
      const { classId, studentIds } = req.body;
  
      const classObj = await Class.findById(classId);
      classObj.students.push(...studentIds);
      await classObj.save();
  
      res.status(200).json({ message: "Students assigned to class successfully", classObj });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.assignStudentsToClass = async (req, res) => {
    try {
      const { classId, studentIds } = req.body;
  
      // Find the class by its ID
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({ error: 'Class not found' });
      }
  
      // Find the students by their IDs
      const students = await User.find({ _id: { $in: studentIds } });
      if (students.length !== studentIds.length) {
        return res.status(404).json({ error: 'Some students not found' });
      }
  
      // Iterate over each student to update their class
      for (let student of students) {
        // If the student is already assigned to a different class, remove them from that class
        if (student.class && student.class.toString() !== classId) {
          await Class.findByIdAndUpdate(student.class, {
            $pull: { students: student._id },
          });
        }
  
        // Assign the new class to the student
        student.class = classId;
  
        // Check if the student is already in the new class, if not, add them
        if (!classDoc.students.includes(student._id)) {
          classDoc.students.push(student._id);
        }
  
        // Save the updated student
        await student.save();
      }
  
      // Save the updated class document after all students have been processed
      await classDoc.save();
  
      // Respond with a success message
      res.status(200).json({ message: 'Students assigned to class successfully' });
    } catch (error) {
      console.error('Error assigning students to class:', error);
      res.status(500).json({ error: 'An error occurred while assigning students to the class' });
    }
  };
  