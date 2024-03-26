import { Request, Response } from "express";
import Report from "../models/Report";

export const createReport = async (req: Request, res: Response) => {
  try {
    const newReport = new Report();
    newReport.adId = req.body.adId;
    newReport.userId = req.body.userId;
    newReport.mainReason = req.body.mainReason;
    newReport.description = req.body.description;
    newReport.optionalInfo = req.body.optionalInfo;
    await newReport.save();

    return res.json({
      success: true,
      message: "You successfully reported the ad!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
    });
  }
};
