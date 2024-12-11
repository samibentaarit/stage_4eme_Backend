const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    required: true,
    unique: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

module.exports = mongoose.model('Class', classSchema);
