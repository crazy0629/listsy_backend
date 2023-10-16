import { Document } from "mongoose";

/**
 * IUser Interface
 * Document class inheritance
 */

export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  isVerified: boolean;
  token: string;
}
