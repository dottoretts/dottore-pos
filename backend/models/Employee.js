const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cnic: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['working', 'not working'],
    default: 'working'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);