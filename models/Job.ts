import { model, Schema } from "mongoose";
import { IJob } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */
const JobSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    jobTitle: { type: String },
    jobDescription: { type: String },
    postDate: { type: Date },
    price: { type: Number },
    priceUnit: { type: String },
    paidType: { type: String },
    workTimeType: { type: String },
    workRemoteType: { type: String },
    jobIndustry: { type: String },
    jobAttachFileName: { type: Array },
    attachOriginalName: { type: Array },
  },
  { timestamps: true }
);

/**
 * IJob Interface Document class inheritance
 */

export default model<IJob>("Job", JobSchema);
