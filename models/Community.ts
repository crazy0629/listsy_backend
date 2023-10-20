import { model, Schema } from "mongoose";
import { ICommunity } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */
const CommunitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, require: true },
    postDate: { type: Date, require: true },
    // userAvatar: { type: String, required: true },
    // userFirstName: { type: String, required: true },
    // userLastName: { type: String, required: true },
    // userReviewCount: { type: Number, required: true },
    // userReviewMark: { type: Number, required: true },
  },
  { timestamps: true }
);

/**
 * ICommunity Interface Document class inheritance
 */

export default model<ICommunity>("Community", CommunitySchema);
