import express from "express";
import { verifyWebhook, handleWebhookEvents } from "../controllers/chatbotWebhook.js";
const router = express.Router();
router.post("/webhook", handleWebhookEvents);
router.get("/webhook", verifyWebhook);
export default router;