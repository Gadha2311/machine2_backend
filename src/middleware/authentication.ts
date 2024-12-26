import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";

import dotenv from "dotenv";
dotenv.config();
import { DecodedToken, CustomRequest } from "../types/userInterface";

const secretKey: any = process.env.JWT_SECRETKEY;

export const authenticateToken: any = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log(token);

  if (!token) {
    return res.status(401).json("Token not provided");
  }
  try {
    const decoded = jwt.verify(token, "secretkey123") as DecodedToken;
    req.currentUser = { id: decoded.id };
    const user = await UserModel.findById(decoded.id);
    console.log("authenticated");

    next();
  } catch (err) {
    return res.status(400).json("Invalid token");
  }
};
