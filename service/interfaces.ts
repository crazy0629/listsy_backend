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
  phoneNumberShare: boolean;
  adCount: number;
}

export interface ICommunity extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  postDate: Date;
}

export interface IUserEmot extends Document {
  userId: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
  emotion: string;
}

export interface IAd extends Document {
  fileType: string;
  adFileName: string;
  imagesFileName: Array<string>;
  uploadDate: Date;
  duration: number;
  state: string;
  address: string;
  lat: number;
  lng: number;
  countryCode: string;
}

export interface IVehicle extends Document {
  userId: Schema.Types.ObjectId;
  adId: Schema.Types.ObjectId;
  price: number;
  priceUnit: string;
  address: string;
  lat: number;
  lng: number;
  countryCode: string;
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
  address: string;
  lat: number;
  lng: number;
  countryCode: string;
  title: string;
  subTitle: string;
  description: string;
  viewCount: number;
  itemCategory: string;
  itemDetailInfo: object;
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
  optionalInfo: string;
}

export interface IChat extends Document {
  senderId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  message: string;
  readState: boolean;
  attachedFileNames: Array<string>;
  originalFileNames: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document {
  fromUserId: Schema.Types.ObjectId;
  toUserId: Schema.Types.ObjectId;
  reviewMark: number;
  reviewContent: string;
}

export interface IChatConnection extends Document {
  fromUserId: Schema.Types.ObjectId;
  toUserId: Schema.Types.ObjectId;
  adId: Schema.Types.ObjectId;
}
