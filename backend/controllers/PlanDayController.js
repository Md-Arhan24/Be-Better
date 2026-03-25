const planDayModel = require("../model/PlanDay");

module.exports.getGoalPlan = async (req, res) => {
  try {
    const plan = await planDayModel
      .find({
        goalId: req.params.goalId,
        userId: req.user.id,
      })
      .sort({ date: 1 });

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.updatePlanDay = async (req, res) => {
  try {
    const updated = await planDayModel.findByIdAndUpdate(
      req.params.planDayId,
      req.body,
      { new: true }, //update the content with the new one
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.markDayComplete = async (req, res) => {
  try {
    const updated = await planDayModel.findByIdAndUpdate(
      req.params.planDayId,
      {
        status: "completed",
        completedAt: new Date(),
      },
      { new: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getTodayPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // // 3️⃣ Find today's tasks
    // <!-- const todayPlans = await PlanDay.find({
    //   userId: req.user.id,
    //   date: {
    //     $gte: today,
    //     $lt: tomorrow
    //   }
    // }).sort({ createdAt: 1 }); -->
    const todayPlans = await planDayModel
      .find({
        userId: req.user.id,
        date: { $gte: today, $lt: tomorrow },
      })
      .populate("goalId", "title status");
    res.status(200).json(todayPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//custom
module.exports.saveCustomPlan = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { days } = req.body; // array of day plans from LLM response

    // days = [{ dayNumber, title, description, resources, estimatedMinutes }]
    const updatePromises = days.map((day) =>
      planDayModel.findOneAndUpdate(
        { goalId, dayNumber: day.dayNumber },
        {
          title: day.title,
          description: day.description,
          resources: day.resources || [],
          estimatedMinutes: day.estimatedMinutes,
        },
        { new: true },
      ),
    );

    await Promise.all(updatePromises);
    res.status(200).json({ message: "Plan saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.implementX = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const start = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const end = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59));

    

    const days = await planDayModel.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end }
    });

    
    
    // Also check WITHOUT userId filter to see if data exists at all
    const allDays = await planDayModel.find({
      date: { $gte: start, $lte: end }
    });
    

    res.json(days);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
