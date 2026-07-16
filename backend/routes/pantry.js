import express from "express";
const router = express.Router();
import * as pantryController from "../controllers/pantryController.js";
import autMiddleware from "../middleware/auth.js";

router.use(autMiddleware);

router.get("/",pantryController.getPantryItems);
router.get("/stats",pantryController.getPantryStats);
router.get("/expiring-soon",pantryController.getExpiringSoon);
router.post("/",pantryController.addPantryItem);
router.put("/:id",pantryController.updatePantryItem);
router.delete("/:id",pantryController.deletePantryItem);

export default router;

