import express from "express";
const router = express.Router();
import * as mealController from "../controllers/mealPlanController.js";
import autMiddleware from "../middleware/auth.js";

router.use(autMiddleware);

router.get("/weekly",mealController.getWeeklyMealPlan);
router.get("/upcoming",mealController.getUpcomingMeals);
router.get("/stats",mealController.getMealPlanStarts);
router.post("/",mealController.addToMealPlan);
router.delete("/:id",mealController.deleteMealPlan);

export default router;
