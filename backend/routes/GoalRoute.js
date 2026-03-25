const express = require('express');
const router = express.Router();
const {createGoal,getUserGoals,getGoalById,updateGoalStatus,deleteGoal} = require('../controllers/GoalController');

router.post("/", createGoal);//--/goals/  POST (create)
router.get("/", getUserGoals);// ---/goals/  GET (see)
router.get("/:goalId", getGoalById);// --- /goals/:goalId  GET (single goal)
router.patch("/:goalId/status", updateGoalStatus);//put diff? ///goals/:goalId/status PUT (update status)
router.delete("/:goalId", deleteGoal);//--- /goals/:goalId  DELETE  (delete goal)


module.exports = router;