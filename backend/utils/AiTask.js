module.exports.generateAITask = (goalTitle, dayNumber, weekNumber) => {
  return {
    title: `Day ${dayNumber} - ${goalTitle}`,
    description: `Focus on structured progress for Week ${weekNumber}`
  };
};
