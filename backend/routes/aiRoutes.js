import express from "express";
import { analyzeResume, saveOptimizedCv } from "../controllers/aiController.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

// POST /ai/analyze-resume  — analyze uploaded resume against a job description
router.post("/analyze-resume", userAuthMiddleware, analyzeResume);

// POST /ai/save-optimized-cv  — persist the AI-generated CV to the user profile
router.post("/save-optimized-cv", userAuthMiddleware, saveOptimizedCv);

export default router;
