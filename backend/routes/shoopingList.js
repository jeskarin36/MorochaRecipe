import express from "express";
const router = express.Router();
import * as shoopingListController from "../controllers/shoppingListController.js";
import autMiddleware from "../middleware/auth.js";

router.use(autMiddleware);

router.get("/",shoopingListController.getShoopingList);
router.post("/generate",shoopingListController.generateFromMealPlan);
router.post("/",shoopingListController.addItem);
router.put("/:id/toggle",shoopingListController.toggleChecked);
router.delete("/:id",shoopingListController.deleteItem);
router.delete("/clear/checked",shoopingListController.clearChecked);
router.delete("/clear/all",shoopingListController.clearAll);
router.post("/add-to-pantry",shoopingListController.addCheckedToPantry);



export default router;
