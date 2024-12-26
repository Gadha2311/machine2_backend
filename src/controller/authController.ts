import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { UserModel } from "../models/userModel";
import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv, { config } from "dotenv";
import { IUser } from "../types/userInterface";
dotenv.config();

export const signUp: any = [
  body("username").notEmpty().withMessage("username is required"),
  body("email").isEmail().withMessage("valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 chars long"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      console.log("Request Body:", req.body);
      const existingEmailUser = await UserModel.findOne({
        email: req.body.email,
      });
      if (existingEmailUser) {
        return res
        .status(400)
        .json({ message: "Email already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(req.body.password, 12);

      const newUser = await UserModel.create({
        ...req.body,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });
      res.status(201).json({
        Stats: "status",
        message: "user registered successfully",
      });
    } catch (error) {
      next(error);
      console.log(error);
    }
  },
];

export const login: any = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user: IUser | null = await UserModel.findOne({ email });

    if (!user) {
      return res
      .status(400)
      .json({ message: "User not found" });
    }
    const ispasswordValid = await bcrypt.compare(password, user.password);
    if (!ispasswordValid) {
      return res
      .status(400)
      .json({ message: "Password is incorrect" });
    }
    const tocken = jwt.sign({ id: user._id }, "secretkey123", {
      expiresIn: "90d",
    });
    res.status(200).json({
      tocken: tocken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};


// export const shortURL= async()=>{
  
// }