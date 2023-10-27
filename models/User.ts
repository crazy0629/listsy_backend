import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: { type: String, required: true },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    token: { type: String, required: true },
    passwordToken: { type: String, required: true },
    reviewCount: { type: Number, required: true, default: 0 },
    reviewMark: { type: Number, required: true, default: 0 },
    bio: { type: String },
    userName: { type: String },
    telephoneNumber: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

/**
 * A promise to be either resolved with the encrypted data salt or rejected with an Error
 */
UserSchema.pre<IUser>("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

/**
 * IUser Interface Document class inheritance
 */

export default model<IUser>("User", UserSchema);
