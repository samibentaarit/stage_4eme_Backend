const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({

  sujet: {
    type: String,
    required: true,
  },
  information: {
    type: String,
    required: true,
  },  
  etat: {
    type: String,
    required: true,
  },
  redacteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    },
  etudiantConserne: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  parentConserne: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }
  ]
}, { 
  timestamps: {
    currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" })
  }
});

module.exports = mongoose.model('Reclamation', reclamationSchema);