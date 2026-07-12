const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assistantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending', 'confirmed', 'in_progress', 'completed', 'cancelled',
        'In Progress', 'Pending Confirmation', 'Completed', 'Disputed'
      ],
      default: 'pending',
    },
    visitProofUrl: {
      type: String,
      default: '',
    },
    visitProofTimestamp: {
      type: Date,
    },
    disputeFeedback: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Please add a total price'],
    },
    tasks: [
      {
        taskName: {
          type: String,
          required: true,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    visitProofs: [
      {
        imageUrl: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          default: '',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    versionKey: '__v', // Optimistic Concurrency Control version key
  }
);

// Compound indexes for optimal search queries
BookingSchema.index({ assistantId: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
