import mongoose, { Document, Schema } from "mongoose";
import { IPost } from "../types/postInterface";

const postSchema = new Schema<IPost>({
  userId: { type: String, required: true },
  username: { type: String },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  img: { type: [String] },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const PostModel = mongoose.model<IPost>("Post", postSchema);
