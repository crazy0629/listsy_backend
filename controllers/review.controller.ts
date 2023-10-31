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
        message: "Error happened while working on db!",
      });
    }
    user.reviewCount = user.reviewCount + 1;
    user.reviewMark =
      (user.reviewMark + req.body.reviewMark) / (user.reviewCount + 1);
    await user.save();

    return res.json({
      success: true,
      message: "Successfully done!",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error happened while working on db!",
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
      senderId: req.body.senderId,
      receiverId: req.body.receiverId,
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

    const reviewObjs = await Review.find({ receiverId: req.body.receiverId });
    const reviewMarkTotal = reviewObjs.reduce(
      (accumulator, currentObject) => accumulator + currentObject.reviewMark,
      0
    );
    userModel.reviewMark = reviewMarkTotal / reviewObjs.length;

    await userModel.save();
    return res.json({
      success: true,
      message: "Successfully changed your reivew",
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
      senderId: req.body.senderId,
      receiverId: req.body.receiverId,
    });
    if (!reviewModel) {
      return res.json({ success: false, message: "Error found!" });
    }

    const userModel = await User.findById(req.body.receiverId);
    if (!userModel) {
      return res.json({ success: false, message: "Error found!" });
    }

    const reviewObjs = await Review.find({ receiverId: req.body.receiverId });
    const reviewMarkTotal = reviewObjs.reduce(
      (accumulator, currentObject) => accumulator + currentObject.reviewMark,
      0
    );
    userModel.reviewMark = reviewMarkTotal / reviewObjs.length;

    await userModel.save();
    return res.json({
      success: true,
      message: "Successfully deleted your reivew",
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
    const reviewItems = await Review.find({ toUserId: req.body.toUserId });
    return res.json({
      success: true,
      message: "Successfully loaded all reviews",
      data: reviewItems,
    });
  } catch (error) {
    return res.json({ success: false, message: "Error found!" });
  }
};
