const router = require('express').Router();

const {getGoalPlan,updatePlanDay,markDayComplete,getTodayPlan,saveCustomPlan,implementX} = require('../controllers/PlanDayController');

router.get("/month",implementX);// ----- /planday/month? --- use to put X on completed days
router.get("/today", getTodayPlan);     // ----/planday/today GET (todays plans)
router.get("/goal/:goalId", getGoalPlan);// -- /planday/goal/:goalId GET (to get goal plan)
router.post("/custom-plan/:goalId", saveCustomPlan);// --- /planday/custom-plan/:goalId (to add custome gpt response)
router.patch("/:planDayId", updatePlanDay);//   /planday/:planDayId PUT (update plan)
router.patch("/:planDayId/complete", markDayComplete);//    /planday/:planDayId/complete PUT (mark day complete)
module.exports = router;


/*// ✅ Static routes FIRST
router.get("/month", implementX);          // ← moved to top
router.get("/today", getTodayPlan);
router.get("/goal/:goalId", getGoalPlan);
router.post("/custom-plan/:goalId", saveCustomPlan);

// ✅ Dynamic :id routes LAST
router.patch("/:planDayId/complete", markDayComplete);
router.patch("/:planDayId", updatePlanDay); */