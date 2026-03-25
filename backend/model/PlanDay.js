const mongoose = require("mongoose");

const resource = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "article", "exercise", "custom"],
  },
  title: String,
  url: String,
});

const dayPlan = new mongoose.Schema(
  {
    //refer to goals
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },
    //refer to id
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    //calender
    date: {
      type: Date,
      required: true,
      index: true,
    },

    dayNumber: {
      type: Number, // Day 1, Day 2...
      required: true,
    },

    weekNumber: {
      type: Number,
    },

    monthNumber: {
      type: Number,
    },

    //day title
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    //refering to resouce
    resources: [resource],

    estimatedMinutes: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
    },
    completedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
    },
  },
  { timestamps: true },
);

//for fast quire
dayPlan.index({goalId: 1, date: 1});

module.exports = mongoose.model("DayPlan",dayPlan);
