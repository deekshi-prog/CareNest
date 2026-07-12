const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    // Geolocation Point (GeoJSON) for distance sorting/matching
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    // Assistant Specific Fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    services: {
      type: [String],
      default: [], // e.g., ['Plant Watering', 'Mail Retrieval', 'Pet Feeding', 'Light Check']
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    availability: [
      {
        dayOfWeek: {
          type: Number, // 0 = Sunday, 1 = Monday, etc.
          min: 0,
          max: 6,
        },
        startTime: {
          type: String, // "08:00"
          default: "09:00",
        },
        endTime: {
          type: String, // "17:00"
          default: "17:00",
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index location field for geospatial queries
ProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Profile', ProfileSchema);
