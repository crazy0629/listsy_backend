import { model, Schema } from "mongoose";
import { ITokenInfo } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */
const TokenInfoSchema = new Schema(
  {
    walletAddress: { type: String, required: true },
    chainId: { type: Number, required: true },
    tokenName: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    tokenImage: { type: String, required: true },
    tokenAddr: { type: String, required: true },
    date: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    tokenAmount: { type: Number, required: true },
    tokenPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

/**
 * IEmailHistory Interface Document class inheritance
 */

export default model<ITokenInfo>("TokenInfo", TokenInfoSchema);
