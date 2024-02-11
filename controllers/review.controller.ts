import { Request, Response } from "express";
import Review from "../models/Review";
import User from "../models/User";
import mongoose from "mongoose";

/**
 * This function adds review objects on db.
 *
 * @param req
 * @param res
 * @returns
 */

export const addReview = async (req: Request, res: Response) => {
  try {
    const model = await Review.findOne({
      fromUserId: req.body.fromUserId,
      toUserId: req.body.toUserId,
    });
    if (model) {
      return res.json({ success: false, message: "Error found!" });
    }
    const newReivew = new Review();
    newReivew.fromUserId = req.body.fromUserId;
    newReivew.toUserId = req.body.toUserId;
    newReivew.reviewContent = req.body.reviewContent;
    newReivew.reviewMark = req.body.reviewMark;

    await newReivew.save();

    const user = await User.findById(
      new mongoose.Types.ObjectId(req.body.toUserId)
    );
    if (!user) {
      return res.json({
        success: false,
        message: "Error found!",
      });
    }
    user.reviewCount = user.reviewCount + 1;
    user.reviewMark =
      (user.reviewMark * (user.reviewCount - 1) + req.body.reviewMark) /
      user.reviewCount;
    await user.save();

    return res.json({
      success: true,
      message: "Successfully done!",
      reviewer: user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

/**
 * This fuctions changes reivew item content and mark
 *
 * @param req
 * @param res
 */

export const changeReview = async (req: Request, res: Response) => {
  try {
    const reviewModel = await Review.findOne({
      fromUserId: req.body.senderId,
      toUserId: req.body.receiverId,
    });
    if (!reviewModel) {
      return res.json({ success: false, message: "Error found!" });
    }
    reviewModel.reviewMark = req.body.reviewMark;
    reviewModel.reviewContent = req.body.reviewContent;

    await reviewModel.save();
    const userModel = await User.findById(req.body.receiverId);
    if (!userModel) {
      return res.json({ success: false, message: "Error found!" });
    }

    const reviewObjs = await Review.find({ toUserId: req.body.receiverId });
    const reviewMarkTotal = reviewObjs.reduce(
      (accumulator, currentObject) => accumulator + currentObject.reviewMark,
      0
    );

    if (reviewObjs.length == 0) {
      userModel.reviewCount = 0;
      userModel.reviewMark = 0;
    } else userModel.reviewMark = reviewMarkTotal / reviewObjs.length;
    await userModel.save();
    return res.json({
      success: true,
      message: "Successfully changed your reivew",
      reviewer: userModel,
      review: reviewModel,
    });
  } catch (error) {
    return res.json({ success: false, message: "Error found!" });
  }
};

/**
 * This function removes review from user.
 *
 * @param req
 * @param res
 * @returns
 */

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const reviewModel = await Review.deleteOne({
      fromUserId: req.body.senderId,
      toUserId: req.body.receiverId,
    });
    if (!reviewModel) {
      return res.json({ success: false, message: "Error found!" });
    }
    const userModel = await User.findById(req.body.receiverId);
    if (!userModel) {
      return res.json({ success: false, message: "Error found!" });
    }

    const reviewObjs = await Review.find({ toUserId: req.body.receiverId });
    const reviewMarkTotal = reviewObjs.reduce(
      (accumulator, currentObject) => accumulator + currentObject.reviewMark,
      0
    );
    if (reviewObjs.length == 0 && reviewMarkTotal == 0)
      (userModel.reviewMark = 0), (userModel.reviewCount = 0);
    else {
      userModel.reviewMark = reviewMarkTotal / reviewObjs.length;
      userModel.reviewCount = userModel.reviewCount - 1;
    }

    await userModel.save();
    return res.json({
      success: true,
      message: "Successfully deleted your reivew",
      reviewer: userModel,
    });
  } catch (error) {
    res.json({ success: false, message: "Error found!" });
  }
};

/**
 * This functions get all reivew items
 *
 * @param req
 * @param res
 */

export const getAllRviews = async (req: Request, res: Response) => {
  try {
    const reviewItems = await Review.find({
      toUserId: req.body.toUserId,
    }).populate("fromUserId", "firstName lastName avatar");

    return res.json({
      success: true,
      message: "Successfully loaded all reviews",
      data: reviewItems,
    });
  } catch (error) {
    return res.json({ success: false, message: "Error found!" });
  }
};

export const checkReviewExists = async (req: Request, res: Response) => {
  try {
    const revieweExist = await Review.findOne({
      fromUserId: req.body.fromUserId,
      toUserId: req.body.toUserId,
    });
    if (revieweExist) {
      return res.json({ success: true, data: revieweExist });
    }
    return res.json({ success: false, message: "No exist" });
  } catch (error) {
    return res.json({ success: false, message: "Error found!" });
  }
};
