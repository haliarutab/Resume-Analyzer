import express from "express";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import { getJobRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

// 🔮 Personalized Job Recommendations
router.get("/recommendations", userAuthMiddleware, getJobRecommendations);

export default router;
