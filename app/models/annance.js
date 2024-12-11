const mongoose = require('mongoose');

const annanceSchema = new mongoose.Schema({
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
  userAudience: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  roleAudience: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',    
      required: false,
    }
  ],
  imageUrl: {
    type: String, // Store the file path or URL of the uploaded image
    required: false,
  }  
}, { 
  timestamps: {
    currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" })
  }
});

module.exports = mongoose.model('Annance', annanceSchema);