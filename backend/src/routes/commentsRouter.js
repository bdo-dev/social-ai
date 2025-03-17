import express from "express";
import { deletecomment, getAllComments } from "../controllers/comments.js";
const router = express.Router();
router.delete("/comment/:id", deletecomment);
router.get("/comments/:postId", getAllComments);
export default router;
