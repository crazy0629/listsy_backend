import { Request, Response } from "express";
import Job from "../models/Job";
import Multer from "multer";

/**
 * This function is to show job list and set filter for jobs.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreJobInfo = async (req: Request, res: Response) => {
  try {
    let condition: any = {};

    if (req.body.jobIndustry.length) {
      condition.jobIndustry = { $in: req.body.jobIndustry };
    }
    if (req.body.workRemoteType.length) {
      condition.workRemoteType = { $in: req.body.workRemoteType };
    }
    if (req.body.workTimeType.length) {
      condition.workTimeType = { $in: req.body.workTimeType };
    }
    if (req.body.paidType.length) {
      condition.paidType = { $in: req.body.paidType };
    }

    const nextJobInfos = await Job.find(condition)
      .populate("userId", "firstName lastName avatar")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextJobInfos,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading job info",
    });
  }
};

/**
 * This function is to upload job
 *
 * @param req
 * @param res
 * @returns
 */

export const uploadJob = async (req: Request, res: Response) => {
  try {
    const newJob = new Job();
    newJob.userId = req.body.userId;
    newJob.jobTitle = req.body.jobTitle;
    newJob.jobDescription = req.body.jobDescription;
    newJob.postDate = req.body.postDate;
    newJob.price = req.body.price;
    newJob.priceUnit = req.body.priceUnit;
    newJob.paidType = req.body.paidType;
    newJob.workTimeType = req.body.workTimeType;
    newJob.workRemoteType = req.body.workRemoteType;
    newJob.jobIndustry = req.body.jobIndustry;
    newJob.addressCity = req.body.addressCity;
    newJob.addressCountry = req.body.addressCountry;
    newJob.addressState = req.body.addressState;

    const multerReq = req as Request & { files?: Multer.Files };

    let jobFileNames: any = [];
    let originalNames: any = [];

    for (let index = 0; index < multerReq.files.length; index++) {
      const { filename, originalname } = multerReq.files[index];
      jobFileNames.push("/uploads/job/" + filename);
      originalNames.push(originalname);
    }
    newJob.jobAttachFileName = jobFileNames;
    newJob.attachOriginalName = originalNames;
    await newJob.save();

    return res.json({ success: true, message: "Job is successfully uploaded" });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};
