import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  createCampaign,
  deleteCampaign,
  donateToCampaign,
  editCampaign,
  getAllCampaigns,
  getSingleCampaign,
  getUserCampaigns,
} from "../controllers/campaign";

const router = express.Router();

// * campaign routes
// * protected routes
router.post("/create", authenticateToken, createCampaign);
router.get("/user", authenticateToken, getUserCampaigns);
router.patch("/:campaignId", authenticateToken, editCampaign);
router.delete("/:campaignId", authenticateToken, deleteCampaign);

// * public routes
router.get("/all", getAllCampaigns);
router.get("/:campaignId", getSingleCampaign);
router.post("/:campaignId/donate", donateToCampaign);

export default router;
