import { Request, Response } from "express";
import Proposal from "../models/Proposal";
import mongoose from "mongoose";
import Multer from "multer";

/**
 * This function saves proposal when users apply for jobs.
 *
 * @param req
 * @param res
 * @returns
 */

export const sendProposal = async (req: Request, res: Response) => {
  try {
    const model = await Proposal.find({
      jobId: new mongoose.Types.ObjectId(req.body.jobId),
      userId: new mongoose.Types.ObjectId(req.body.userId),
    });
    if (model) {
      return res.json({ success: false, message: "Proposal already exists!" });
    }

    const newProposal = new Proposal();
    newProposal.jobId = req.body.jobId;
    newProposal.userId = req.body.userId;
    newProposal.sentDate = req.body.sentDate;
    newProposal.proposalContent = req.body.proposalContent;

    const multerReq = req as Request & { files?: Multer.Files };

    let proposalFileNames: any = [];
    for (let index = 0; index < multerReq.files.length; index++) {
      const { filename } = multerReq.files[index];
      proposalFileNames.push("/uploads/job/" + filename);
    }
    newProposal.attachedFileNames = proposalFileNames;

    await newProposal.save();

    return res.json({ success: true, message: "Job is successfully uploaded" });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while working on database!",
    });
  }
};
