import express from "express";
import { addMessageToSession, createChatSession, fetchChatSessions, handleTextMessage, updateChatSessionMetadata } from "../controllers/chatbotController.js"; // Adjust the import path
import { authenticateUser } from "../middleware/auth.js";
const router = express.Router();

// Route for text messages
router.post("/chat/text", authenticateUser, handleTextMessage);
router.get("/chat-sessions", authenticateUser, fetchChatSessions);
router.post("/chat-sessions", authenticateUser, createChatSession);
router.post("/chat-sessions/:sessionId/messages", authenticateUser, addMessageToSession);
router.put("/chat-sessions/:sessionId/metadata", authenticateUser, updateChatSessionMetadata);
export default router;