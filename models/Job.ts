import { model, Schema } from "mongoose";
import { IJob } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */
const JobSchema = new Schema(
  {
    userId: { type: String },
    jobTitle: { type: String },
    jobDescription: { type: String },
    postDate: { type: Date },
    price: { type: Number },
    priceUnit: { type: String },
    fixedPrice: { type: Boolean },
    workTimeType: { type: String },
    workRemoteType: { type: String },
    jobIndustry: { type: String },
  },
  { timestamps: true }
);

/**
 * IJob Interface Document class inheritance
 */

export default model<IJob>("Job", JobSchema);
