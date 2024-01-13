import { Request, Response } from "express";
import Community from "../models/Community";
import mongoose from "mongoose";

/**
 * Add community function
 *
 * @param req
 * @param res
 */

export const addCommunity = async (req: Request, res: Response) => {
  try {
    const newCommunity = new Community();
    newCommunity.userId = req.body.userId;
    newCommunity.title = req.body.title;
    newCommunity.postDate = req.body.postDate;

    await newCommunity.save();

    const latestCommunity = await Community.find()
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .sort({ postDate: -1 })
      .limit(6);

    res.json({
      success: true,
      message: "Post successful! It's now live in the community space",
      model: latestCommunity,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

/**
 * This function gets latest community information.
 *
 * @param req
 * @param res
 * @returns
 */

export const getLatesetCommunity = async (req: Request, res: Response) => {
  try {
    const latestCommunity = await Community.find()
      .populate("userId", "firstName lastName avatar")
      .sort({ postDate: -1 })
      .limit(6);
    if (!latestCommunity) {
      return res.json({ success: false, message: "Community not exist" });
    }
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: latestCommunity,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading community",
    });
  }
};

/**
 * This function is to get more community when users scroll down community list.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreCommunity = async (req: Request, res: Response) => {
  const condition = {
    title: { $regex: req.body.searchString, $options: "i" },
  };

  try {
    let latestCommunity;
    if (req.body.searchString == "") {
      latestCommunity = await Community.find()
        .populate("userId", "firstName lastName avatar reviewCount reviewMark")
        .sort({ postDate: -1 })
        .skip(req.body.index * 20)
        .limit(20);
    } else {
      latestCommunity = await Community.find(condition)
        .populate("userId", "firstName lastName avatar reviewCount reviewMark")
        .sort({ postDate: -1 })
        .skip(req.body.index * 20)
        .limit(20);
    }

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: latestCommunity,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found while loading more community",
    });
  }
};

/**
 * This function is to delete community
 *
 * @param req
 * @param res
 * @returns
 */

export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const community = await Community.findByIdAndDelete(
      new mongoose.Types.ObjectId(req.body.communityId)
    );
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

/**
 * This function creates community which was created by user.
 *
 * @param req
 * @param res
 */

export const getCommunityByUser = async (req: Request, res: Response) => {
  try {
    const communityList = await Community.find({ userId: req.body.userId });

    if (!communityList) {
      return res.json({ success: false, message: "Community not exist" });
    }
    return res.json({
      success: true,
      data: communityList,
      message: "Successfully got your community!",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while getting user's community!",
    });
  }
};
