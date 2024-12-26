import { Document } from "mongoose";
import { Request} from "express";
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}



export interface DecodedToken {
  id: string;
}

export interface CustomRequest extends Request {
  
  currentUser?: { id: string };
  
}
export interface DecodedToken {
  id: string;
}