import { model, Schema } from "mongoose";
import { IProposal } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */ 1;
const ProposalSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    sentDate: { type: Date },
    proposalContent: { type: String },
    attachedFileNames: { type: Array },
  },
  { timestamps: true }
);

/**
 * IProposal Interface Document class inheritance
 */

export default model<IProposal>("Proposal", ProposalSchema);
