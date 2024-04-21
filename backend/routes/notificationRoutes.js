import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  allNotification,
  updateNotification,
} from "../controllers/notificationControllers.js";

const router = express.Router();

router.route("/").get(protect, allNotification);
router.route("/:id").put(protect, updateNotification);

export default router;
