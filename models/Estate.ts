import { model, Schema } from "mongoose";
import { IForSale } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const EstateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    adId: { type: Schema.Types.ObjectId, ref: "Ad" },
    price: { type: Number },
    priceUnit: { type: String },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    countryCode: { type: String },
    title: { type: String },
    subTitle: { type: String },
    description: { type: String },
    viewCount: { type: Number },
    itemCategory: { type: String },
    itemDetailInfo: { type: Object },
  },
  { timestamps: true }
);

/**
 * IForSale Interface Document class inheritance
 */

export default model<IForSale>("Estate", EstateSchema);
