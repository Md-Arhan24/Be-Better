const mongoose = require("mongoose");

const goals = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    type: {
      type: String,
      enum: ["ai_generated", "custom"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
    dailyTimeMinutes: {
      type: Number, // 90 minutes
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Goal",goals);
