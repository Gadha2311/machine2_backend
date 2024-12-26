"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.editPost = exports.getAllPosts = exports.createPost = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postModel_1 = require("../models/postModel");
const userModel_1 = require("../models/userModel");
const cloudinary_1 = __importDefault(require("cloudinary"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_APIKEY,
    api_secret: process.env.CLOUD_APISECRET,
});
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        console.log(token);
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.decode(token);
        console.log(decoded);
        req.body.userId = decoded.id;
        console.log(req.body.userId);
        const user = yield userModel_1.UserModel.findById(decoded.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        req.body.username = user.username;
        console.log(req.files.img);
        const images = req.files;
        console.log(`images ${images}`);
        if (images) {
            const imageUrls = yield Promise.all(images.img.map((image) => cloudinary_1.default.v2.uploader.upload(image.filepath)));
            console.log(`imageurl ${imageUrls}`);
            req.body.img = imageUrls.map((imageUrl) => imageUrl.secure_url);
        }
        const newPost = new postModel_1.PostModel(req.body);
        const savedPost = yield newPost.save();
        res.status(201).json({
            message: "Post created successfully",
            post: savedPost,
        });
    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Error creating post" });
    }
});
exports.createPost = createPost;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch posts from the database and sort them by creation date (newest first)
        const posts = yield postModel_1.PostModel.find().sort({ createdAt: -1 });
        if (posts.length === 0) {
            res.status(404).json({ message: "No posts found" });
            return;
        }
        res.status(200).json({
            message: "Posts fetched successfully",
            posts,
        });
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Error fetching posts" });
    }
});
exports.getAllPosts = getAllPosts;
const editPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        const user = yield userModel_1.UserModel.findById(decoded.id);
        if (!user) {
            res.status(404).json({ message: "User  not found" });
            return;
        }
        const postId = req.params.selectedPostId;
        const post = yield postModel_1.PostModel.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        if (post.userId.toString() !== decoded.id) {
            res.status(403).json({ message: "Forbidden: Cannot edit this post" });
            return;
        }
        const { title, content } = req.body;
        console.log(req.body.title);
        let img = post.img;
        if ((_b = req.files) === null || _b === void 0 ? void 0 : _b.img) {
            const images = Array.isArray(req.files.img) ? req.files.img : [req.files.img];
            const uploadedImages = yield Promise.all(images.map((image) => cloudinary_1.default.v2.uploader.upload(image.filepath)));
            img = uploadedImages.map((image) => image.secure_url);
        }
        const updatedPost = yield postModel_1.PostModel.findByIdAndUpdate(postId, { title, content, img }, { new: true, runValidators: true } // Ensure validation is run
        );
        if (!updatedPost) {
            res.status(404).json({ message: "Post update failed" });
            return;
        }
        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost,
        });
    }
    catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Error updating post" });
    }
});
exports.editPost = editPost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // const token = req.headers.authorization?.split(" ")[1];
        // if (!token) {
        //   res.status(401).json({ message: "Unauthorized" });
        //   return;
        // }
        // const decoded = jwt.decode(token) as DecodedToken;
        // if (!decoded?.id) {
        //   res.status(401).json({ message: "Invalid token" });
        //   return;
        // }
        // const user = await UserModel.findById(decoded.id);
        // if (!user) {
        //   res.status(404).json({ message: "User not found" });
        //   return;
        // }
        const postId = req.params.selectedPostId;
        const post = yield postModel_1.PostModel.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        // // Check if the user is the author of the post
        // if (post.userId.toString() !== decoded.id) {
        //   res.status(403).json({ message: "Forbidden: You are not allowed to delete this post" });
        //   return;
        // }
        // If the post has an image, delete it from Cloudinary
        if (post.img && post.img.length > 0) {
            // Cloudinary image deletion - Assuming post.img contains an array of image URLs
            for (const imageUrl of post.img) {
                const publicId = (_a = imageUrl.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0]; // Extract publicId from URL
                if (publicId) {
                    yield cloudinary_1.default.v2.uploader.destroy(publicId); // Delete image from Cloudinary
                }
            }
        }
        // Delete the post from the database
        yield postModel_1.PostModel.findByIdAndDelete(postId);
        res.status(200).json({
            message: "Post deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Error deleting post" });
    }
});
exports.deletePost = deletePost;
