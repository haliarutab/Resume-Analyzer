import express from "express";
import {
  getAllNotifications,
  markNotificationRead,
  markAllRead,
} from "../controllers/notificationController.js";
import hybridAuth from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

router.get("/all", hybridAuth, getAllNotifications);
router.put("/read", hybridAuth, markNotificationRead);
router.put("/read/all", hybridAuth, markAllRead);

export default router;
