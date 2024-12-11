const User = require('../models/user.model');
const Role = require('../models/role.model');
const Class = require('../models/Class'); 

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

// Find all users
exports.findAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('roles');
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Find all students
exports.findAllStudents = async (req, res) => {
  try {
    const students = await User.find().populate('roles').populate('class').populate('parents');
    const studentsWithRole = students.filter(user =>
      user.roles.some(role => role.name === 'student')
    );
    
    if (studentsWithRole.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.status(200).json(studentsWithRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Find all parents
exports.findAllParents = async (req, res) => {
  try {
    const parents = await User.find().populate('roles').populate('class');
    const parentsWithRole = parents.filter(user =>
      user.roles.some(role => role.name === 'parent')
    );
    
    if (parentsWithRole.length === 0) {
      return res.status(404).json({ message: 'No parents found' });
    }

    res.status(200).json(parentsWithRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//fix this
// Find parent by id
exports.findParentById = async (req, res) => {
  try {
    const parentId = req.params.id;
    const parent = await User.findById(parentId).populate('roles');

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.status(200).json(parent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignParentsToChild = async (req, res) => {
  const { childId, parentIds } = req.body;

  try {
    // Find the child user by ID
    const childUser = await User.findById(childId);
    if (!childUser) {
      return res.status(404).json({ message: 'Child user not found' });
    }

    // Update the child's parents field
    childUser.parents = parentIds;

    // Update the parents' children field
    await User.updateMany(
      { _id: { $in: parentIds } },
      { $addToSet: { children: childUser._id } }
    );

    // Save the updated child user
    await childUser.save();

    res.status(200).json({ message: 'Parents assigned successfully', childUser });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};

// Find all roles
exports.findAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    
    if (roles.length === 0) {
      return res.status(404).json({ message: 'No roles found' });
    }

    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update user by id
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, classId, parentIds, isStudent } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    if (username) user.username = username;
    if (email) user.email = email;
    if (typeof isStudent === 'boolean') user.isStudent = isStudent;

    // Update class assignment
    if (classId) {
      // Remove the user from the previous class if assigned
      if (user.class && user.class.toString() !== classId) {
        await Class.findByIdAndUpdate(user.class, { $pull: { students: user._id } });
      }

      // Update the user's class and add the user to the new class
      user.class = classId;
      await Class.findByIdAndUpdate(classId, { $addToSet: { students: user._id } });
    } else {
      // Remove the user from the current class if classId is not provided
      if (user.class) {
        await Class.findByIdAndUpdate(user.class, { $pull: { students: user._id } });
        user.class = null;
      }
    }

    // Update parent assignment
    if (parentIds) {
      user.parents = parentIds;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};