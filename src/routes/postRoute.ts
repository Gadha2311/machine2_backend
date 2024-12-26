import { Router } from "express";
import { authenticateToken } from "../middleware/authentication";
import { fileparser } from "../middleware/imageUpload";
import { createPost, deletePost, editPost, getAllPosts } from "../controller/postController";

const router = Router();

router.post("/createPost",fileparser, createPost);
router.get("/posts",authenticateToken, getAllPosts)
router.post("/editPosts/:selectedPostId",authenticateToken,fileparser,editPost)
router.delete("/deletePosts/:selectedPostId",authenticateToken,deletePost)

export default router;
