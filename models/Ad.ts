import { model, Schema } from "mongoose";
import { IAd } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */
const AdSchema = new Schema(
  {
    fileType: { type: String },
    adFileName: { type: String },
    imagesFileName: { type: Array },
    uploadDate: { type: Date },
    duration: { type: Number },
  },
  { timestamps: true }
);

/**
 * IAd Interface Document class inheritance
 */

export default model<IAd>("Ad", AdSchema);
