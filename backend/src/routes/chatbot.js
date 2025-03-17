import express from "express";
import {
  addMessageToSession,
  createChatSession,
  fetchChatSessions,
  handleTextMessage,
  updateChatSessionMetadata,
  mergeActiveSession,

} from "../controllers/chatbotController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();


// Existing routes
router.post("/chat/text", authenticateUser, handleTextMessage);

router.get("/chat-sessions", authenticateUser, fetchChatSessions);
router.post("/chat-sessions", authenticateUser, createChatSession);
router.post(
  "/chat-sessions/:sessionId/messages",
  authenticateUser,
  addMessageToSession
);
router.put(
  "/chat-sessions/:sessionId/metadata",
  authenticateUser,
  updateChatSessionMetadata
);

// Add new routes for active session operations
router.post(
  "/chat-sessions/merge",
  authenticateUser,
  mergeActiveSession
);



export default router;