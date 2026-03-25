const mongoose = require("mongoose");

const mileStone = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    targetDate: {
      type: Date,
    },

    dayNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "achieved"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MileStone", mileStone);
