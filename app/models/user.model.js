const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }
  ],
  isStudent: Boolean,
  parents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'  // Reference to the Class model
  }
});

module.exports = mongoose.model('User', UserSchema);
