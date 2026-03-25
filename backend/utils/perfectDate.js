const {generateAITask} = require('./AiTask');
const {generateEmptyTask} = require('./customTask');
module.exports.generatePlanDays = (goal) => {
  const days = [];

  const start = new Date(goal.startDate);

  for (let i = 0; i < goal.durationDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    const dayNumber = i + 1;

    const weekNumber = Math.ceil(dayNumber / 7);

    // Calculate month number properly (calendar-based)
    const monthNumber =
      currentDate.getMonth() - start.getMonth() +
      12 * (currentDate.getFullYear() - start.getFullYear()) + 1;

    // Generate task content
    const taskContent =
      goal.type === "ai_generated"
        ? generateAITask(goal.title, dayNumber, weekNumber)
        : generateEmptyTask(dayNumber);

    days.push({
      goalId: goal._id,
      userId: goal.userId,
      date: currentDate,
      dayNumber,
      weekNumber,
      monthNumber,
      title: taskContent.title,
      description: taskContent.description,
      estimatedMinutes: goal.dailyTimeMinutes,
      status: "pending"
    });
  }

  return days;
};