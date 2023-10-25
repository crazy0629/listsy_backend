import { model, Schema } from "mongoose";
import { IVehicle } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const VehicleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    adId: { type: Schema.Types.ObjectId, ref: "Ad" },
    price: { type: Number },
    priceUnit: { type: String },
    title: { type: String },
    subTitle: { type: String },
    description: { type: String },
    viewCount: { type: Number },
    vehicleType: { type: String },
    saleType: { type: String },
    condition: { type: String },
    vehicleMake: { type: String },
    vehicleModel: { type: String },
    year: { type: String },
    mileage: { type: Number },
    mileageUnit: { type: String },
    gearBox: { type: String },
    fuelType: { type: String },
    doors: { type: Number },
    color: { type: String },
    bodyType: { type: String },
    seat: { type: String },
  },
  { timestamps: true }
);

/**
 * IVehicle Interface Document class inheritance
 */

export default model<IVehicle>("Vehicle", VehicleSchema);
