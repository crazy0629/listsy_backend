import { Request, Response } from "express";
import Proposal from "../models/Proposal";
import mongoose from "mongoose";
import Multer from "multer";

/**
 * This function checks if user already applied for this job.
 *
 * @param req
 * @param res
 * @returns
 */

export const checkIsApplied = async (req: Request, res: Response) => {
  try {
    const model = await Proposal.findOne({
      jobId: new mongoose.Types.ObjectId(req.body.jobId),
      userId: new mongoose.Types.ObjectId(req.body.userId),
    });
    if (model) {
      return res.json({ success: true, isApplied: true });
    }
    return res.json({ success: true, isApplied: false });
  } catch (error) {
    return res.json({ success: false, message: "Error found!" });
  }
};

/**
 * This function saves proposal when users apply for jobs.
 *
 * @param req
 * @param res
 * @returns
 */

export const sendProposal = async (req: Request, res: Response) => {
  try {
    const newProposal = new Proposal();
    newProposal.jobId = req.body.jobId;
    newProposal.userId = req.body.userId;
    newProposal.sentDate = req.body.sentDate;
    newProposal.proposalContent = req.body.proposalContent;

    const multerReq = req as Request & { files?: Multer.Files };

    let proposalFileNames: any = [];
    let attachedOriginalNames: any = [];

    for (let index = 0; index < multerReq.files.length; index++) {
      const { filename, originalname } = multerReq.files[index];
      proposalFileNames.push("/uploads/job/" + filename);
      attachedOriginalNames.push(originalname);
    }
    newProposal.attachedFileNames = proposalFileNames;
    newProposal.attachOriginalNames = attachedOriginalNames;

    await newProposal.save();

    return res.json({ success: true, message: "Successfully Applied!" });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while working on database!",
    });
  }
};

/**
 * This function is called when user is going to check proposals for jobs they posted
 *
 * @param req
 * @param res
 */

export const getProposalListPerJob = async (req: Request, res: Response) => {
  try {
    const proposalList = await Proposal.find({ jobId: req.body.jobId })
      .populate("userId")
      .sort({ sentDate: -1 });
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: proposalList,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error happened while loading proposals",
    });
  }
};
