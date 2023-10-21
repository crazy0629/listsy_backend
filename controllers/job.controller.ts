import { Request, Response } from "express";
import Job from "../models/Job";
import { json } from "stream/consumers";

export const uploadJob = async (req: Request, res: Response) => {
  try {
    const newJob = new Job();
    newJob.userId = req.body.userId;
    newJob.jobTitle = req.body.jobTitle;
    newJob.jobDescription = req.body.jobDescription;
    newJob.postDate = new Date();
    newJob.price = req.body.price;
    newJob.priceUnit = req.body.priceUnit;
    newJob.fixedPrice = req.body.fixedPrice;
    newJob.workTimeType = req.body.workTimeType;
    newJob.workRemoteType = req.body.workRemoteType;
    newJob.jobIndustry = req.body.jobIndustry;

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
