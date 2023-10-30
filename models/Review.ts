import { model, Schema } from "mongoose";
import { IReview } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const ReviewSchema = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User" },
    toUserId: { type: Schema.Types.ObjectId, ref: "User" },
    reviewMark: { type: Number },
    reviewContent: { type: String },
  },
  { timestamps: true }
);

/**
 * IReview Interface Document class inheritance
 */

export default model<IReview>("Review", ReviewSchema);
