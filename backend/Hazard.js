const mongoose = require('mongoose');

const HazardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(value) {
          return value.length === 2;
        },
        message: 'Coordinates must be an array of two numbers [longitude, latitude]',
      },
    },
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

HazardSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hazard', HazardSchema);
