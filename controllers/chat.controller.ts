import { Response, Request } from "express";
import Chat from "../models/Chat";
import ChatConnection from "../models/ChatConnection";
import User from "../models/User";
import Multer from "multer";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const socketIO = require("socket.io");
const clients = new Set();

export const setupWebSocket = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: `${process.env.HOST_URL}`,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Handle incoming messages from the client
    addConnection(io, socket.handshake.query.userId);

    // Handle client disconnection
    socket.on("disconnect", () => {
      // console.log("A client disconnected");
    });
  });
};

const addConnection = (io, userId) => {
  let flag = 0;
  clients.forEach((client: any) => {
    if (client.userId == userId) flag = 1;
  });
  if (!flag) {
    clients.add({ io, userId });
  }
};

export const addChatUserList = async (req: Request, res: Response) => {
  try {
    if (req.body.receiverId != "no-user") {
      const models = await ChatConnection.find({
        $or: [
          { fromUserId: req.body.senderId, toUserId: req.body.receiverId },
          { fromUserId: req.body.receiverId, toUserId: req.body.senderId },
        ],
      });
      if (!models.length) {
        let newChatConnection = new ChatConnection();
        newChatConnection.fromUserId = req.body.senderId;
        newChatConnection.toUserId = req.body.receiverId;
        await newChatConnection.save();
      }
    }

    let chatUserIdList: any = [];

    const chatUserConnections = await ChatConnection.find({
      $or: [{ fromUserId: req.body.senderId }, { toUserId: req.body.senderId }],
    });

    for (let index = 0; index < chatUserConnections.length; index++) {
      const element = chatUserConnections[index];
      if (element.fromUserId == req.body.senderId)
        chatUserIdList.push(element.toUserId);
      else chatUserIdList.push(element.fromUserId);
    }

    const chatUsers = await User.find({ _id: { $in: chatUserIdList } });

    let messages: any = [];
    if (req.body.receiverId != "no-user") {
      messages = await Chat.find({
        $or: [
          { senderId: req.body.senderId, receiverId: req.body.receiverId },
          { senderId: req.body.receiverId, receiverId: req.body.senderId },
        ],
      })
        .populate("senderId")
        .populate("receiverId")
        .sort({ createdAt: 1 });
    }

    res.json({ success: true, data: chatUsers, messages });
  } catch (error) {
    res.json({ success: false, message: "DB Error found!" });
  }
};

const sendToReceiver = (receiverId, data) => {
  clients.forEach((client: any) => {
    if (client.userId == receiverId) client.io.emit("server", data);
  });
};

export const addMessage = async (req: Request, res: Response) => {
  try {
    let newChatObj = new Chat();
    newChatObj.senderId = req.body.senderId;
    newChatObj.receiverId = req.body.receiverId;
    newChatObj.message = req.body.message;
    newChatObj.readState = false;
    await newChatObj.save();

    const messages = await Chat.find({
      $or: [
        { senderId: req.body.senderId, receiverId: req.body.receiverId },
        { senderId: req.body.receiverId, receiverId: req.body.senderId },
      ],
    })
      .populate("senderId")
      .populate("receiverId")
      .sort({ createdAt: 1 });
    sendToReceiver(req.body.receiverId, messages);

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.json({ success: false, message: "DB error found!" });
  }
};

/*


export const addMessage = async (req: Request, res: Response) => {
  try {
    let newChatObj = new Chat();
    newChatObj.senderId = req.body.senderId;
    newChatObj.receiverId = req.body.receiverId;
    newChatObj.message = req.body.message;
    newChatObj.readState = false;

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

    const messages = await Chat.find({
      $or: [
        { senderId: req.body.senderId, receiverId: req.body.receiverId },
        { senderId: req.body.receiverId, receiverId: req.body.senderId },
      ],
    })
      .populate("senderId")
      .populate("receiverId")
      .sort({ createdAt: 1 });
    sendToReceiver(req.body.receiverId, messages);
    return res.json({
      success: true,
      data: messages,
    });
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
    })
      .populate("senderId")
      .populate("receiverId")
      .sort({ createdAt: 1 });

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

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const chatLists = await Chat.find({ _id: { $in: req.body.idList } });
    chatLists.map(async (item: any) => {
      item.readState = true;
      await item.save();
    });
    const messages = await Chat.find({
      $or: [
        { senderId: req.body.senderId, receiverId: req.body.receiverId },
        { senderId: req.body.receiverId, receiverId: req.body.senderId },
      ],
    })
      .populate("senderId")
      .populate("receiverId")
      .sort({ createdAt: 1 });
    sendToReceiver(req.body.receiverId, messages);
  } catch (error) {
    console.log(error);
  }
};

export const addMemberOnChat = async (req: Request, res: Response) => {
  try {
    if (req.body.posterId != "no-user") {
      const message = await Chat.find({
        $or: [
          { senderId: req.body.userId, receiverId: req.body.posterId },
          { senderId: req.body.posterId, receiverId: req.body.userId },
        ],
      });
      if (message.length == 0) {
        const newChatItem = new Chat();
        newChatItem.senderId = req.body.userId;
        newChatItem.receiverId = req.body.posterId;
        newChatItem.message = "";
        newChatItem.readState = true;
        await newChatItem.save();
      }
    }

    const messageHistory = await Chat.find({
      $or: [{ senderId: req.body.userId }, { receiverId: req.body.userId }],
    });

    let chatUserIdLists: any = [];
    for (let index = 0; index < messageHistory.length; index++) {
      if (messageHistory[index].senderId == req.body.userId)
        chatUserIdLists.push(messageHistory[index].receiverId);
      else chatUserIdLists.push(messageHistory[index].senderId);
    }

    const chatUserLists = await User.find({ _id: { $in: chatUserIdLists } });

    let messages: any = [];
    if (req.body.posterId != "no-user") {
      messages = await Chat.find({
        $or: [
          { senderId: req.body.userId, receiverId: req.body.posterId },
          { senderId: req.body.posterId, receiverId: req.body.userId },
        ],
      })
        .populate("senderId")
        .populate("receiverId")
        .sort({ createdAt: 1 });
    }

    return res.json({
      success: true,
      data: chatUserLists,
      messages,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error found while loading messages",
    });
  }
};
*/
