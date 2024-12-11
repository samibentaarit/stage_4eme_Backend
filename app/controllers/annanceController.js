const Annance = require('../models/annance');
const broadcast = require('../../ws.js');  // Import the broadcast function
const admin = require('firebase-admin');
const User = require('../models/user.model.js');  // Import User model
const Role = require('../models/role.model.js');  // Import Role model
const sendEmail = require('../../mailer.js');  // Import the sendEmail function
const upload = require('../middlewares/upload'); // import the upload middleware
const multer = require('multer');
const path = require('path');

// Create a new annance
exports.createAnnance = [
  async (req, res) => {
    try {
      const { etat, sujet, information,redacteur , userAudience, roleAudience } = req.body;
      
      // Validate userAudience and roleAudience
      const validUserAudience = await User.find({ _id: { $in: userAudience } }).select('_id');
      const validRoleAudience = await Role.find({ _id: { $in: roleAudience } }).select('_id');

      // Create new Annance
      const newAnnance = new Annance({
        etat,
        sujet,
        information,
        redacteur,
        userAudience: validUserAudience.map(user => user._id),
        roleAudience: validRoleAudience.map(role => role._id),
        image: req.file ? req.file.path : null, // Store the file path if an image is uploaded
      });

      await newAnnance.save();

      // Broadcast the new annance to all connected clients
      broadcast(newAnnance);

      // Send FCM notification
      const message = {
        notification: {
          title: 'New Annance',
          body: `${sujet}: ${information}`,
        },
        topic: 'annance',
      };

      admin.messaging().send(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });

      res.status(201).json(newAnnance);
    } catch (error) {
      console.error('Error creating annance:', error);
      res.status(500).json({ error: 'Failed to create annance' });
    }
  }
];

exports.createAnnanceMail = [
  async (req, res) => {
    try {
      const { etat, sujet, information,redacteur , userAudience, roleAudience } = req.body;

      // Create new Annance
      const newAnnance = new Annance({
        etat,
        sujet,
        information,
        redacteur,
        userAudience,
        roleAudience,
        image: req.file ? req.file.path : null, // Store the file path if an image is uploaded
      });
      await newAnnance.save();

      // Broadcast the new annance to all connected clients
      broadcast(newAnnance);

      // Send FCM notification
      const message = {
        notification: {
          title: 'New Annance',
          body: `${sujet}: ${information}`,
        },
        topic: 'annance',
      };

      admin.messaging().send(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });

      // Collect audience emails
      let audienceEmails = [];

      // Add emails from userAudience
      if (userAudience && userAudience.length > 0) {
        const users = await User.find({ _id: { $in: userAudience } });
        audienceEmails.push(...users.map(user => user.email));
      }

      // Add emails from roleAudience
      if (roleAudience && roleAudience.length > 0) {
        const roles = await Role.find({ _id: { $in: roleAudience } }).populate('users');
        for (const role of roles) {
          const usersWithRole = await User.find({ roles: role._id });
          audienceEmails.push(...usersWithRole.map(user => user.email));
        }
      }

      // Remove duplicates
      audienceEmails = [...new Set(audienceEmails)];

      // Send email to each audience member
      const emailSubject = `New Annance: ${sujet}`;
      const emailText = `Here is a new annance: \n\n${information}`;
      
      audienceEmails.forEach(email => {
        sendEmail(email, emailSubject, emailText, req.file ? req.file.path : null)
          .then(() => console.log(`Email sent to ${email}`))
          .catch(error => console.error(`Error sending email to ${email}:`, error));
      });

      res.status(201).json(newAnnance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];



// Get all annances
exports.getAllAnnances = async (req, res) => {
  try {
    const annances = await Annance.find().populate('redacteur', 'username');
    res.status(200).json(annances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single annance by ID
exports.getAnnanceById = async (req, res) => {
  try {
    const annance = await Annance.findById(req.params.id);
    if (!annance) {
      return res.status(404).json({ message: 'Annance not foundssss' });
    }
    res.status(200).json(annance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get annances by user ID and role
exports.getAnnancesByUserAndRole = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // // Find the user and their roles
    // const user = await User.findById(userId).populate('roles');
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    // // Check if the user has the specified role
    // const hasRole = user.roles.some(role => role._id.toString() === roleId);
    // if (!hasRole) {
    //   return res.status(403).json({ message: 'User does not have the specified role' });
    // }

    // Find annances for the user and their roles
    const annances = await Annance.find({
      $or: [
        { userAudience: userId },
        { roleAudience: roleId }
      ]
    });

    res.status(200).json(annances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get annances by optional user ID and role ID
exports.getAnnancesByUserOrRole = async (req, res) => {
  try {
    const { userId, roleId } = req.query;

    if (!userId && !roleId) {
      return res.status(400).json({ message: 'Either userId or roleId must be provided' });
    }
    // Construct query based on provided parameters
    const query = {
      $or: [
        userId ? { userAudience: userId } : null,
        roleId ? { roleAudience: roleId } : null
      ].filter(Boolean) // Remove null values from the array
    };

    const annances = await Annance.find(query);

    res.status(200).json(annances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get annances for a specific user based on their ID and roles
exports.getAnnancesForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find the user and populate their roles
    const user = await User.findById(userId).populate('roles');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRoles = user.roles.map(role => role._id);

    // Construct the query
    const query = {
      $or: [
        { userAudience: userId },
        { roleAudience: { $in: userRoles } }
      ]
    };

    const annances = await Annance.find(query);

    res.status(200).json(annances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Update an annance by ID
exports.updateAnnanceById = async (req, res) => {
  try {
    const { etat, sujet, information, audienceType, audience } = req.body;

    // Validate audience based on type
    let validAudience = [];
    if (audienceType === 'single' || audienceType === 'multiple') {
      validAudience = await User.find({ _id: { $in: audience } }).select('_id');
    } else if (audienceType === 'role') {
      validAudience = await Role.find({ _id: { $in: audience } }).select('_id');
    }

    const updatedAnnance = await Annance.findByIdAndUpdate(
      req.params.id,
      { etat, sujet, information, audienceType, audience: validAudience },
      { new: true, runValidators: true }
    );

    if (!updatedAnnance) {
      return res.status(404).json({ message: 'Annance not found' });
    }

    res.status(200).json(updatedAnnance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an annance by ID
exports.deleteAnnanceById = async (req, res) => {
  try {
    const deletedAnnance = await Annance.findByIdAndDelete(req.params.id);
    if (!deletedAnnance) {
      return res.status(404).json({ message: 'Annance not found' });
    }
    res.status(200).json({ message: 'Annance deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};    
