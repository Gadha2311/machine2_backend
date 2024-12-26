import { model, Schema } from "mongoose";
import { IUser } from "../types/userInterface";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const UserModel = model<IUser>("User", userSchema);
export { UserModel };
