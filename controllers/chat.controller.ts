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
    socket.on("disconnect", () => {});

    socket.on("addMessage", (data) => {
      addMessage(data);
    });

    socket.on("addChatUserList", (data) => {
      addChatUser(data);
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

const addChatUser = async (data: any) => {
  try {
    if (data.receiverId != "no-user") {
      const models = await ChatConnection.find({
        $or: [
          { fromUserId: data.senderId, toUserId: data.receiverId },
          { fromUserId: data.receiverId, toUserId: data.senderId },
        ],
      });
      if (!models.length) {
        let newChatConnection = new ChatConnection();
        newChatConnection.fromUserId = data.senderId;
        newChatConnection.toUserId = data.receiverId;
        await newChatConnection.save();
      }
    }

    let chatUserIdList: any = [];

    const chatUserConnections = await ChatConnection.find({
      $or: [{ fromUserId: data.senderId }, { toUserId: data.senderId }],
    });

    for (let index = 0; index < chatUserConnections.length; index++) {
      const element = chatUserConnections[index];
      if (element.fromUserId == data.senderId)
        chatUserIdList.push(element.toUserId);
      else chatUserIdList.push(element.fromUserId);
    }

    const chatUsers = await User.find({ _id: { $in: chatUserIdList } });

    let messages: any = [];
    if (data.receiverId != "no-user") {
      messages = await Chat.find({
        $or: [
          { senderId: data.senderId, receiverId: data.receiverId },
          { senderId: data.receiverId, receiverId: data.senderId },
        ],
      })
        .populate("senderId")
        .populate("receiverId")
        .sort({ createdAt: 1 });
    }
    clients.forEach((client: any) => {
      if (client.userId == data.senderId) {
        client.io.emit("getChatUserList", {
          success: true,
          data: chatUsers,
          id: data.senderId,
          messages,
        });
      }
    });
  } catch (error) {
    clients.forEach((client: any) => {
      if (client.userId == data.senderId)
        client.io.emit("getChatUserList", {
          success: false,
          message: "DB Error found!",
        });
    });
  }
};

const addMessage = async (data: any) => {
  try {
    let newChatObj = new Chat();
    newChatObj.senderId = data.senderId;
    newChatObj.receiverId = data.receiverId;
    newChatObj.message = data.message;
    newChatObj.readState = false;
    await newChatObj.save();

    const newMessage = await Chat.findById(newChatObj.id)
      .populate("senderId")
      .populate("receiverId");
    clients.forEach((client: any) => {
      if (client.userId == data.senderId || client.userId == data.receiverId) {
        const flag = client.userId == data.senderId ? 1 : 0;
        client.io.emit("newMessage", {
          success: true,
          message: newMessage,
          senderId: data.senderId,
          receiverId: data.receiverId,
          flag,
        });
      }
    });
  } catch (error) {
    clients.forEach((client: any) => {
      if (client.userId == data.senderId || client.userId == data.receiverId)
        client.io.emit("newMessage", {
          success: false,
          message: "DB error found!",
        });
    });
  }
};

/*
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
*/
