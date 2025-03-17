import express from "express";
import { generateContent, generateImage } from "../controllers/AI.js";
const router = express.Router();
router.post("/generateImage", generateImage);
router.post("/generateContent", generateContent);
export default router;