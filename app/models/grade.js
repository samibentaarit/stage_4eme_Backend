const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  gradeName: {
    type: String,
    required: true,
  },
  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    }
  ]
});

module.exports = mongoose.model('Grade', gradeSchema);
