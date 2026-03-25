// utils/streakHelper.js
module.exports.calculateStreak = (lastActivityDate, currentStreak) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight

  if (!lastActivityDate) {
    // First time activity
    return { current: 1, lastActivityDate: today };
  }

  const last = new Date(lastActivityDate);
  last.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today — no change
    return { current: currentStreak, lastActivityDate: last };
  } else if (diffDays === 1) {
    // Active yesterday — increment streak
    return { current: currentStreak + 1, lastActivityDate: today };
  } else {
    // Missed a day — reset streak
    return { current: 1, lastActivityDate: today };
  }
};