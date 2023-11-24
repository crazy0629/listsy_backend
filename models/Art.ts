import { model, Schema } from "mongoose";
import { IForSale } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const ArtSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    adId: { type: Schema.Types.ObjectId, ref: "Ad" },
    price: { type: Number },
    priceUnit: { type: String },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    title: { type: String },
    subTitle: { type: String },
    description: { type: String },
    viewCount: { type: Number },
    itemCategory: { type: String },
    itemCondition: { type: String },
    itemColor: { type: String },
    dimensionW: { type: Number },
    dimensionH: { type: Number },
    dimensionUnit: { type: String },
    itemWeight: { type: Number },
    itemUnit: { type: String },
    brandName: { type: String },
    manufacturer: { type: String },
  },
  { timestamps: true }
);

/**
 * Garden Interface Document class inheritance
 */

export default model<IForSale>("art", ArtSchema);
