import { model, Schema } from "mongoose";
import { IWalletList } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */
const WalletListSchema = new Schema(
  {
    walletAddress: { type: String, required: true },
    chainName: { type: String, required: true },
    isVisited: { type: Boolean, required: true },
  },
  { timestamps: true }
);

/**
 * IEmailHistory Interface Document class inheritance
 */

export default model<IWalletList>("WalletList", WalletListSchema);
