import mongoose, { Schema, Model, Document } from "mongoose";
import { UserRole } from "@/types/next-auth";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false, // Don't expose password by default
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["ADMIN", "RECRUITER"],
      default: "RECRUITER", // Default to RECRUITER
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
