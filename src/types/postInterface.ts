import { Request } from "express";
import { Files } from "formidable";

export interface ExtendedRequest extends Request {
  files: any;
}

export interface IPost extends Document {
  userId:string;
  username:string,
  title: string;
  content: string;
  img?: string[];
  createdAt: Date;
}
