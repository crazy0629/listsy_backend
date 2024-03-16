import { model, Schema } from "mongoose";
import { IReport } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const ReportSchema = new Schema(
  {
    adId: { type: Schema.Types.ObjectId, ref: "Ad" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    mainReason: { type: String },
    description: { type: String },
    optionalInfo: { type: String },
  },
  { timestamps: true }
);

/**
 * IReport Interface Document class inheritance
 */

export default model<IReport>("Report", ReportSchema);
