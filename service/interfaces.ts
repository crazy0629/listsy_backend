import { Document } from "mongoose";

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
  avatar: string;
  bio: string;
  userName: string;
  telephoneNumber: string;
  addressCity: string;
  addressCountry: string;
}

export interface ICommunity extends Document {
  userId: string;
  title: string;
  postDate: Date;
}

export interface IEstate extends Document {
  isVideoAds: number;
  videoFileName: string;
  imagesFileName: Array<string>;
  price: number;
  priceUnit: string;
  uploadDate: Date;
  userId: string;
  title: string;
  subTitle: string;
  description: string;
  viewCount: number;
  listingType: string;
  propertyType: string;
  bedroomCount: number;
  bathroomCount: number;
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
  isVideoAds: number;
  videoFileName: string;
  imagesFileName: Array<string>;
  price: number;
  priceUnit: string;
  uploadDate: Date;
  userId: string;
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
  userId: string;
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
