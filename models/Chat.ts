import { model, Schema } from "mongoose";
import { IChat } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const ChatSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    sentDate: { type: Date },
    replyFrom: { type: String },
    readState: { type: Boolean },
    attachedFileNames: { type: Array },
    originalFileNames: { type: Array },
  },
  { timestamps: true }
);

/**
 * IChat Interface Document class inheritance
 */

export default model<IChat>("Chat", ChatSchema);
