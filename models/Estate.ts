import { model, Schema } from "mongoose";
import { IEstate } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */
const EstateSchema = new Schema(
  {
    fileType: { type: String },
    adFileName: { type: String },
    imagesFileName: { type: Array },
    price: { type: Number },
    priceUnit: { type: String },
    uploadDate: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String },
    subTitle: { type: String },
    description: { type: String },
    viewCount: { type: Number },
    listingType: { type: String },
    propertyType: { type: String },
    bedroomCount: { type: Number },
    bathroomCount: { type: Number },
    tenure: { type: String },
    propertyCondition: { type: String },
    postCode: { type: String },
    yearBuilt: { type: Number },
    builtSurface: { type: Number },
    builtSurfaceUnit: { type: String },
    plotSurface: { type: Number },
    plotSurfaceUnit: { type: String },
    keyFeatures: { type: Array },
    nearestAttraction: { type: Array },
    facilities: { type: Array },
  },
  { timestamps: true }
);

/**
 * IEstate Interface Document class inheritance
 */

export default model<IEstate>("Estate", EstateSchema);
