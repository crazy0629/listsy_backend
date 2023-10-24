import { Document, Schema } from "mongoose";

/**
 * IUser Interface
 * Document class inheritance
 */

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  token: string;
  passwordToken: string;
  reviewCount: number;
  reviewMark: number;
  avatar: string;
  bio: string;
  userName: string;
  telephoneNumber: string;
  addressCity: string;
  addressCountry: string;
}

export interface ICommunity extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  postDate: Date;
}

export interface IAd extends Document {
  fileType: string;
  adFileName: string;
  imagesFileName: Array<string>;
  uploadDate: Date;
  duration: number;
}

export interface IEstate extends Document {
  userId: Schema.Types.ObjectId;
  adId: Schema.Types.ObjectId;
  price: number;
  priceUnit: string;
  title: string;
  subTitle: string;
  description: string;
  viewCount: number;
  listingType: string;
  propertyType: string;
  bedroomCount: string;
  bathroomCount: string;
  tenure: string;
  propertyCondition: string;
  postCode: string;
  yearBuilt: number;
  builtSurface: number;
  builtSurfaceUnit: string;
  plotSurface: number;
  plotSurfaceUnit: string;
  keyFeatures: Array<string>;
  nearestAttraction: Array<string>;
  facilities: Array<string>;
}

export interface IVehicle extends Document {
  userId: Schema.Types.ObjectId;
  adId: Schema.Types.ObjectId;
  price: number;
  priceUnit: string;
  title: string;
  subTitle: string;
  description: string;
  viewCount: number;
  vehicleType: string;
  saleType: string;
  condition: string;
  vehicleMake: string;
  vehicleModel: string;
  year: number;
  mileage: number;
  mileageUnit: string;
  gearbox: string;
  fuelType: string;
  doors: number;
  color: string;
  bodyType: string;
  seat: number;
}

export interface IJob extends Document {
  userId: Schema.Types.ObjectId;
  jobTitle: string;
  jobDescription: string;
  postDate: Date;
  price: number;
  priceUnit: string;
  fixedPrice: boolean;
  workTimeType: string;
  workRemoteType: string;
  jobIndustry: string;
}
