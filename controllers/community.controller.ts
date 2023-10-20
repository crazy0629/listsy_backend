import { Request, Response } from "express";
import Community from "../models/Community";

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
      message: "Community is sucessfully added!",
      model: latestCommunity,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error happened while adding new community!",
    });
  }
};

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
    if (!latestCommunity) {
      return res.json({ success: false, message: "Community not exist" });
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
