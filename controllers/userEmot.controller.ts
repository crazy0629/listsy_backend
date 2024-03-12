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
    const emotCount = await getEmotCount(req.body.postId);

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

export const getEmotCount = async (postId: string) => {
  const heartsEyesArray = await UserEmot.find({
    emotion: "heartsEyes",
    postId,
  });
  const monocleArray = await UserEmot.find({ emotion: "monocle", postId });
  const flameArray = await UserEmot.find({ emotion: "flame", postId });
  const redHeartArray = await UserEmot.find({ emotion: "redHeart", postId });
  const thumbsUpArray = await UserEmot.find({ emotion: "thumbsUp", postId });

  let countRes = {
    heartsEyes: heartsEyesArray.length ?? 0,
    monocle: monocleArray.length ?? 0,
    flame: flameArray.length ?? 0,
    redHeart: redHeartArray.length ?? 0,
    thumbsUp: thumbsUpArray.length ?? 0,
  };

  return countRes;
};
