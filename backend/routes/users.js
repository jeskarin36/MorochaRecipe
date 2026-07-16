import express from "express";
const router = express.Router();
import * as userController from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";


router.use(authMiddleware);

router.get("/profile",userController.getProfile);
router.post("/profile",userController.updateProfile);
router.post("/preferences",userController.updatePreferences);
router.post("/change-password",userController.changePassword);
router.post("/account",userController.deleteAccount);

export default router;