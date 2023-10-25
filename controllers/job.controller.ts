import { Request, Response } from "express";
import Job from "../models/Job";
import Multer from "multer";

export const uploadJob = async (req: Request, res: Response) => {
  try {
    const newJob = new Job();
    newJob.userId = req.body.userId;
    newJob.jobTitle = req.body.jobTitle;
    newJob.jobDescription = req.body.jobDescription;
    newJob.postDate = req.body.postDate;
    newJob.price = req.body.price;
    newJob.priceUnit = req.body.priceUnit;
    newJob.fixedPrice = req.body.fixedPrice;
    newJob.workTimeType = req.body.workTimeType;
    newJob.workRemoteType = req.body.workRemoteType;
    newJob.jobIndustry = req.body.jobIndustry;

    const multerReq = req as Request & { files?: Multer.Files };

    let jobFileNames: any = [];
    for (let index = 0; index < multerReq.files.length; index++) {
      const { filename } = multerReq.files[index];
      jobFileNames.push("/uploads/job/" + filename);
    }
    newJob.jobAttachFileName = jobFileNames;

    await newJob.save();

    return res.json({ success: true, message: "Job is successfully uploaded" });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error happened while uploading job",
    });
  }
};
