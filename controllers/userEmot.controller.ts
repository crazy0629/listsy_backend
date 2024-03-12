import { Request, Response } from "express";
import mongoose from "mongoose";
import UserEmot from "../models/UserEmot";

export const clickUserEmotion = async (req: Request, res: Response) => {
  try {
    const userEmot = await UserEmot.findOne({
      userId: new mongoose.Types.ObjectId(req.body.userId),
      postId: new mongoose.Types.ObjectId(req.body.postId),
      emotion: req.body.emotion,
    });
    if (!userEmot) {
      // Create
      const userEmotModel = new UserEmot();
      userEmotModel.userId = req.body.userId;
      userEmotModel.postId = req.body.postId;
      userEmotModel.emotion = req.body.emotion;

      await userEmotModel.save();
    } else {
      // Remove
      await UserEmot.deleteOne({
        userId: new mongoose.Types.ObjectId(req.body.userId),
        postId: new mongoose.Types.ObjectId(req.body.postId),
        emotion: req.body.emotion,
      });
    }
    const emotCount = await getEmotCount();

    res.json({
      success: true,
      count: emotCount,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error,
    });
  }
};

export const getEmotCount = async () => {
  const likeArray = await UserEmot.find({ emotion: "like" });
  const dislikeArray = await UserEmot.find({ emotion: "dislike" });
  const sadArray = await UserEmot.find({ emotion: "sad" });
  const angryArray = await UserEmot.find({ emotion: "angry" });
  const kiddingArray = await UserEmot.find({ emotion: "kidding" });

  let countRes = {
    like: likeArray.length ?? 0,
    dislike: dislikeArray.length ?? 0,
    sad: sadArray.length ?? 0,
    angry: angryArray.length ?? 0,
    kidding: kiddingArray.length ?? 0,
  };

  return countRes;
};
