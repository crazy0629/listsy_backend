import { Request, Response } from "express";
import Community from "../models/Community";

export const addCommunity = async (req: Request, res: Response) => {
  try {
    const newCommunity = new Community();
    newCommunity.userId = req.body.userId;
    newCommunity.title = req.body.title;
    newCommunity.postDate = new Date();
    await newCommunity.save();
    res.json({
      success: true,
      message: "Community is sucessfully added!",
      model: newCommunity,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error happened while adding new community!",
    });
  }
};

export const getCommunityOffset = async (req: Request, res: Response) => {
  try {
    const latestCommunity = await Community.find()
      .sort({ postDate: -1 })
      .skip(req.body.index * 20)
      .limit(20);
    if (!latestCommunity) {
      return res.json({ success: false, message: "Community not exist" });
    }
    return res.json({ success: true, message: "Successfully loaded!" });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading community",
    });
  }
};

export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const community = await Community.deleteOne({
      userId: req.body.userId,
      title: req.body.title,
    });
    if (!community) {
      return res.json({ success: false, message: "Community not exist" });
    }
    return res.json({ success: true, message: "Successfully deleted!" });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while deleting community",
    });
  }
};
