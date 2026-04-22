import express from "express";
import upload from "../src/utils/upload.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import {
  registerUser,
  loginUser,
  fetchUserData,
  applyJob,
  getUserAppliedJobs,
  uploadResume,
  getAllUsers 
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register-user", upload.single("image"), registerUser);
router.post("/login-user", loginUser);
router.get("/user-data", userAuthMiddleware, fetchUserData);
router.post("/apply-job", userAuthMiddleware, applyJob);
router.get("/all-users", getAllUsers);

router.get("/user-applications", userAuthMiddleware, getUserAppliedJobs);
router.post("/upload-resume", userAuthMiddleware, upload.single("resume"), uploadResume);

export default router;
