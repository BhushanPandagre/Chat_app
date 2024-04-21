import express from "express";
const router = express.Router();
import {
  registerUser,
  authUser,
  allUsers,
  logout,
  updateUser,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser).get("/logout", protect, logout);
router.post("/update", protect, updateUser);

export default router;
