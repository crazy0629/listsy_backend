import { Response, Request } from "express";
import Chat from "../models/Chat";
import Multer from "multer";
import mongoose from "mongoose";

export const addMessage = async (req: Request, res: Response) => {
  try {
    let newChatObj = new Chat();
    newChatObj.senderId = req.body.senderId;
    newChatObj.receiverId = req.body.receiverId;
    newChatObj.message = req.body.message;
    newChatObj.sentDate = req.body.sentDate;
    newChatObj.replyFrom = req.body.replyFrom;

    const multerReq = req as Request & { files?: Multer.Files };

    let chatFileNames: any = [];
    let chatFileOriginalNames: any = [];

    for (let index = 0; index < multerReq.files.length; index++) {
      const { filename, originalname } = multerReq.files[index];
      chatFileNames.push("/upload/chat/" + filename);
      chatFileOriginalNames.push(originalname);
    }

    newChatObj.attachedFileNames = chatFileNames;
    newChatObj.originalFileNames = chatFileOriginalNames;

    await newChatObj.save();
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while working on db!",
    });
  }
};

export const editMessage = async (req: Request, res: Response) => {
  try {
    let chatItem = await Chat.findById(
      new mongoose.Types.ObjectId(req.body.chatId)
    );
    if (!chatItem) {
      return res.json({ success: false, message: "Error found!" });
    }
    chatItem.message = req.body.message;
    await chatItem.save();
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    let chatItem = await Chat.findByIdAndDelete(
      new mongoose.Types.ObjectId(req.body.chatId)
    );

    if (!chatItem) {
      return res.json({
        success: false,
        message: "Error found while deleting message!",
      });
    }

    let refChatItems = await Chat.find({ replyFrom: req.body.chatId });

    for (let index = 0; index < refChatItems.length; index++) {
      refChatItems[index].replyFrom = "";
      await refChatItems[index].save();
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

export const getMessageHistory = async (req: Request, res: Response) => {
  try {
    const messages = await Chat.find({
      $or: [
        { senderId: req.body.senderId, receiverId: req.body.receiverId },
        { senderId: req.body.receiverId, receiverId: req.body.senderId },
      ],
    }).sort({ sentDate: 1 });

    return res.json({
      success: true,
      message: "Successfully loaded messages",
      data: messages,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found loading messages",
    });
  }
};
