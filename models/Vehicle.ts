import { model, Schema } from "mongoose";
import { IVehicle } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */
const VehicleSchema = new Schema(
  {
    videoFileName: { type: String },
    imagesFileName: { type: Array },
    price: { type: Number },
    priceUnit: { type: String },
    uploadDate: { type: Date },
    userId: { type: String },
    title: { type: String },
    subTitle: { type: String },
    description: { type: String },
    viewCount: { type: Number },
    vehicleType: { type: String },
    saleType: { type: String },
    condition: { type: String },
    vehicleMake: { type: String },
    vehicleModel: { type: String },
    year: { type: Number },
    mileage: { type: Number },
    mileageUnit: { type: String },
    gearbox: { type: String },
    fuelType: { type: String },
    doors: { type: Number },
    color: { type: String },
    bodyType: { type: String },
    seat: { type: Number },
  },
  { timestamps: true }
);

/**
 * IVehicle Interface Document class inheritance
 */

export default model<IVehicle>("Vehicle", VehicleSchema);
