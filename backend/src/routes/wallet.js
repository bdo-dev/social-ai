import express from "express";
import { addTokens, deductToken, wallet } from "../controllers/wallet.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();
router.get("/wallet", authenticateUser, wallet);
router.post("/wallet/add-tokens", authenticateUser, addTokens);
router.post("/wallet/deduct-tokens", authenticateUser, deductToken);

export default router;
