import { model, Schema } from "mongoose";
import { IUserEmot } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const UserEmotSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "Ad" },
    emotion: { type: String },
  },
  { timestamps: true }
);

/**
 * UserEmot Interface Document class inheritance
 */

export default model<IUserEmot>("UserEmot", UserEmotSchema);
