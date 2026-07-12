const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      default: 'email',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    errorLogs: [
      {
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    nextAttemptAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', JobSchema);
