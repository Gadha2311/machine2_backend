import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import  { File } from "formidable";
import { PostModel } from "../models/postModel";
import { UserModel } from "../models/userModel";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import { DecodedToken } from "../types/userInterface";
import { ExtendedRequest } from "../types/postInterface";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_APISECRET,
});


export const createPost = async (
  req: ExtendedRequest,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const decoded = jwt.decode(token) as DecodedToken;
    console.log(decoded);

    req.body.userId = decoded.id;
    console.log(req.body.userId);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    req.body.username = user.username;
    console.log(req.files.img);

    const images = req.files;
    console.log(`images ${images}`);

    if (images) {
      const imageUrls = await Promise.all(
        (images.img as File[]).map((image: File) =>
          cloudinary.v2.uploader.upload(image.filepath)
        )
      );
      console.log(`imageurl ${imageUrls}`);

      req.body.img = imageUrls.map((imageUrl) => imageUrl.secure_url);
    }

    const newPost = new PostModel(req.body);

    const savedPost = await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post" });
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    const skip = (page - 1) * limit;

    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await PostModel.countDocuments();

    if (posts.length === 0) {
      res.status(404).json({ message: "No posts found" });
      return;
    }

    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};
export const editPost = async (
  req: ExtendedRequest,
  res: Response
): Promise<void> => {
  try {
   const decoded=req.currentUser

    const postId = req.params.selectedPostId;
    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.userId.toString() !== decoded?.id) {
      res.status(403).json({ message: "Forbidden: Cannot edit this post" });
      return;
    }

    const { title, content } = req.body;
    console.log(req.body.title);

    let img = post.img;
    if (req.files?.img) {
      const images = Array.isArray(req.files.img)
        ? req.files.img
        : [req.files.img];
      const uploadedImages = await Promise.all(
        images.map((image: File) =>
          cloudinary.v2.uploader.upload(image.filepath)
        )
      );
      img = uploadedImages.map((image) => image.secure_url);
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { title, content, img },
      { new: true, runValidators: true } // Ensure validation is run
    );

    if (!updatedPost) {
      res.status(404).json({ message: "Post update failed" });
      return;
    }

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post" });
  }
};

export const deletePost = async (
  req: ExtendedRequest,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.selectedPostId;
    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.img && post.img.length > 0) {
      for (const imageUrl of post.img) {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }
    }

    await PostModel.findByIdAndDelete(postId);

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
};
