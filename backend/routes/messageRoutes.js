import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  allMessage,
  sendMessage,
  updatedMessage,
} from "../controllers/messageControllers.js";

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessage);
router.route("/update").put(protect, updatedMessage);

export default router;
