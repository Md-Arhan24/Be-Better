const goalModel = require('../model/Goal');
const planDayModel = require('../model/PlanDay');
const {generatePlanDays} = require('../utils/perfectDate');
const mongoose = require('mongoose');

module.exports.createGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      dailyTimeMinutes,
      startDate,
      durationDays
    } = req.body;

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays - 1);

    const goal = await goalModel.create({
      userId: req.user.id, // from auth middleware
      title,
      description,
      type,
      dailyTimeMinutes,
      startDate,
      endDate,
      durationDays
    });

    //  Generate plan days
    const planDays = generatePlanDays(goal);

    await planDayModel.insertMany(planDays);
    //await PlanDay.insertMany(planDays, { ordered: false });

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getUserGoals = async (req, res) => {
  try {
    const goals = await goalModel.find({ userId: req.user.id })
      .sort({ createdAt: -1 });//why -1 : desending order

    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//goal by id
module.exports.getGoalById = async (req, res) => {
     // Add this check - if the monggose id is wrong, them this works
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(404).json({ message: "Goal not found" });
    }
  try {
    const goal = await goalModel.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update status
module.exports.updateGoalStatus = async (req, res) => {
     // Add this check - if the monggose id is wrong, them this works
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(404).json({ message: "Goal not found" });
    }

  try {
    const { status } = req.body;

    const allowedStatuses = ["active", "paused", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const goal = await goalModel.findOneAndUpdate(
      {
        _id: req.params.goalId,
        userId: req.user.id
      },
      { status },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//deleted goals
module.exports.deleteGoal = async (req, res) => {
     // Add this check - if the monggose id is wrong, them this works
       if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(404).json({ message: "Goal not found" });
    }

  try {
    const goal = await goalModel.findOneAndDelete({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Delete all related plan days
    await planDayModel.deleteMany({ goalId: goal._id });

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

