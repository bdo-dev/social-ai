import express from "express";
import {
  deletecomment,
  hideComment,
  deleteAllPostComments,
  getAllComments,
} from "../controllers/comments.js";
const router = express.Router();
router.delete("/comment/:id", deletecomment);
router.post("/comment/:id/hide", hideComment);
router.get("/comment/:id", deleteAllPostComments);
router.get("/comments", getAllComments);
export default router;
