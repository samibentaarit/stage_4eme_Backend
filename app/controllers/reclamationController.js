const Reclamation = require('../models/reclamation');
const broadcast = require('../../ws.js');  // Import the broadcast function
const admin = require('firebase-admin');
const User = require('../models/user.model.js');  // Import User model
const Role = require('../models/role.model.js');  // Import Role model
const sendEmail = require('../../mailer.js');  // Import the sendEmail function
// Create a new reclamation
exports.createReclamationDefault = async (req, res) => {
  try {
    const { sujet, information, etat, redacteur, etudiantConserne, parentConserne } = req.body;

    // Create a new Reclamation document
    const newReclamation = new Reclamation({ sujet, information, etat, redacteur, etudiantConserne, parentConserne });

    // Save the new reclamation
    await newReclamation.save();

    // Respond with the created reclamation
    res.status(201).json(newReclamation);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Create a new reclamation with automatic parent population
exports.createReclamation = async (req, res) => {
  try {
    const { sujet, information, etat, redacteur, etudiantConserne } = req.body;

    // Fetch parents of the concerned students
    let parentConserne = [];

    if (etudiantConserne && etudiantConserne.length > 0) {
      // Fetch all students from the etudiantConserne array
      const students = await User.find({ _id: { $in: etudiantConserne } });

      // Collect parents from all students
      students.forEach(student => {
        if (student.parents && student.parents.length > 0) {
          parentConserne.push(...student.parents);
        }
      });

      // Remove duplicates from the parentConserne array
      parentConserne = [...new Set(parentConserne.map(parent => parent.toString()))];
    }

    // Create a new Reclamation document
    const newReclamation = new Reclamation({ sujet, information, etat, redacteur, etudiantConserne, parentConserne });

    // Save the new reclamation
    await newReclamation.save();

    // Broadcast the new reclamation (if applicable)
    // broadcast(newReclamation); // Uncomment if you have a broadcast function

    // Optionally send notifications (e.g., via FCM)
    const message = {
      notification: {
        title: 'New Reclamation',
        body: `${sujet}: ${information}`,
      },
      topic: 'reclamation',
    };

    admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });

    // Respond with the created reclamation
    res.status(201).json(newReclamation);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};


// Get all reclamations
exports.getAllReclamations = async (req, res) => {
  try {
    // Fetch all reclamations
    const reclamations = await Reclamation.find()
      .populate('redacteur', 'username email')
      .populate('etudiantConserne', 'username email')
      .populate('parentConserne', 'name');

    // Respond with the list of reclamations
    res.status(200).json(reclamations);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Get a single reclamation by ID
exports.getReclamationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the reclamation by ID
    const reclamation = await Reclamation.findById(id)
      .populate('redacteur', 'username email')
      .populate('etudiantConserne', 'username email')
      .populate('parentConserne', 'name');

    if (!reclamation) {
      return res.status(404).json({ message: 'Reclamation not found' });
    }

    // Respond with the reclamation
    res.status(200).json(reclamation);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Method to get reclamations for a specific user by user ID
exports.getReclamationsForUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find reclamations where the user is either the redacteur, a concerned student, or a concerned parent
    const reclamations = await Reclamation.find({
      $or: [
        //zid hadhi ken thab redacteur
        //{ redacteur: userId },
        { etudiantConserne: userId },
        { parentConserne: userId },
      ],
    })
      .populate('redacteur', 'username') // Customize populated fields as necessary
      .populate('etudiantConserne', 'username') // Customize populated fields as necessary
      .populate('parentConserne', 'username'); // Customize populated fields as necessary

    // Respond with the list of reclamations
    res.status(200).json(reclamations);
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ message: 'An error occurred while fetching reclamations', error });
  }
};





// Update a reclamation by ID
exports.updateReclamationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { sujet, information, etat, redacteur, etudiantConserne, parentConserne } = req.body;

    // Update the reclamation document
    const updatedReclamation = await Reclamation.findByIdAndUpdate(
      id,
      { sujet, information, etat, redacteur, etudiantConserne, parentConserne },
      { new: true, runValidators: true }
    );

    if (!updatedReclamation) {
      return res.status(404).json({ message: 'Reclamation not found' });
    }

    // Respond with the updated reclamation
    res.status(200).json(updatedReclamation);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Delete a reclamation by ID
exports.deleteReclamationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the reclamation document
    const deletedReclamation = await Reclamation.findByIdAndDelete(id);

    if (!deletedReclamation) {
      return res.status(404).json({ message: 'Reclamation not found' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Reclamation deleted successfully' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};
