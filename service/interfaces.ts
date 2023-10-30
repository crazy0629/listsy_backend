import { Document, Schema } from "mongoose";

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
  state: string;
}

export interface IEstate extends Document {
  userId: Schema.Types.ObjectId;
  adId: Schema.Types.ObjectId;
  price: number;
  priceUnit: string;
  addressCountry: string;
  addressState: string;
  addressCity: string;
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
  addressCountry: string;
  addressState: string;
  addressCity: string;
  title: string;
  subTitle: string;
  description: string;
  viewCount: number;
  vehicleType: string;
  saleType: string;
  condition: string;
  vehicleMake: string;
  vehicleModel: string;
  year: String;
  mileage: number;
  mileageUnit: string;
  gearBox: string;
  fuelType: string;
  doors: number;
  color: string;
  bodyType: string;
  seat: string;
}

export interface IForSale extends Document {
  userId: Schema.Types.ObjectId;
  adId: Schema.Types.ObjectId;
  price: number;
  priceUnit: string;
  addressCountry: string;
  addressState: string;
  addressCity: string;
  title: string;
  subTitle: string;
  description: string;
  viewCount: number;
  itemCategory: string;
  itemCondition: string;
  itemColor: string;
  dimensionW: number;
  dimensionH: number;
  dimensionUnit: string;
  itemWeight: number;
  itemUnit: string;
  brandName: string;
  manufacturer: string;
}

export interface IJob extends Document {
  userId: Schema.Types.ObjectId;
  jobTitle: string;
  jobDescription: string;
  postDate: Date;
  price: number;
  priceUnit: string;
  addressCity: string;
  addressState: string;
  addressCountry: string;
  paidType: string;
  workTimeType: string;
  workRemoteType: string;
  jobIndustry: string;
  jobAttachFileName: Array<string>;
  attachOriginalName: Array<string>;
}

export interface IProposal extends Document {
  jobId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  sentDate: Date;
  proposalContent: string;
  attachedFileNames: Array<string>;
  attachOriginalNames: Array<string>;
}

export interface IReport extends Document {
  adId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  mainReason: string;
  description: string;
  startPoint: string;
}

export interface IChat extends Document {
  senderId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  message: string;
  sentDate: Date;
  attachedFileNames: Array<string>;
  originalFileNames: Array<string>;
}
