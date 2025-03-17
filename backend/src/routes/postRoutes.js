import express from "express";
import {
  createPost,
  updatePost,
  getPosts,
  deletePost,
} from "../controllers/postController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();
// router.use(authenticateUser);
router.post("/posts", authenticateUser, createPost);
router.put("/posts/:id", authenticateUser, updatePost);
router.get("/posts", authenticateUser, getPosts);
router.delete("/posts/:id", authenticateUser, deletePost);

export default router;
