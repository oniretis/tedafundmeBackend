import express from "express";
import {
  forgotPassword,
  getUser,
  loginUser,
  registerUser,
  resetPassword,
  verifyUser,
} from "../controllers/auth";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// * auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// * protected user route
router.get("/get-user", authenticateToken, getUser);

export default router;
