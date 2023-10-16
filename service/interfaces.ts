import { Document } from "mongoose";

/**
 * IWalletList Interface
 * Document class inheritance
 */

export interface IWalletList extends Document {
  walletAddress: string;
  chainName: string;
  isVisited: boolean;
}

export interface ITokenInfo extends Document {
  walletAddress: string;
  chainId: number;
  tokenName: string;
  tokenSymbol: string;
  tokenImage: string;
  tokenAddr: string;
  date: string;
  blockNumber: Number;
  tokenAmount: number;
  tokenPrice: number;
}
