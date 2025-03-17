import express from "express";
import { countEngagement, reachPost } from "../controllers/engagement.js";
const router = express.Router();
router.get("/engagement/:id", countEngagement);
router.get("/engagementReach/:id", reachPost);
export default router;