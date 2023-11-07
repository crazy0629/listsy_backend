import { model, Schema } from "mongoose";
import { IChatConnection } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const ChatConnectionSchema = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User" },
    toUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/**
 * IChat Interface Document class inheritance
 */

export default model<IChatConnection>("ChatConnection", ChatConnectionSchema);
