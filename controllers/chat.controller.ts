import { Response, Request } from "express";
import Chat from "../models/Chat";
import ChatConnection from "../models/ChatConnection";
import User from "../models/User";
import Multer from "multer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { chatReplyCheckEmail } from "../service/chatReplyCheckEmail";

dotenv.config();

const socketIO = require("socket.io");
const clients = new Set();

const mailgun = require("mailgun-js")({
  apiKey: process.env.Mailgun_API_KEY,
  domain: "spyderreceipts.com",
});

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
          {
            fromUserId: data.senderId,
            toUserId: data.receiverId,
            adId: data.adId,
          },
          {
            fromUserId: data.receiverId,
            toUserId: data.senderId,
            adId: data.adId,
          },
        ],
      });
      if (!models.length) {
        let newChatConnection = new ChatConnection();
        newChatConnection.fromUserId = data.senderId;
        newChatConnection.toUserId = data.receiverId;
        newChatConnection.adId = data.adId;
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

const checkForReply = async (messageId) => {
  const originalMsg = await Chat.findById(
    new mongoose.Types.ObjectId(messageId)
  );

  const replyMsg = await Chat.findOne({
    senderId: originalMsg?.receiverId,
    receiverId: originalMsg?.senderId,
    createdAt: {
      $gt: originalMsg?.createdAt,
    },
  });

  if (replyMsg) return true;
  return false;
};

const sendChatReplyEmail = async (
  email: string,
  name: string,
  senderName: string,
  senderId: string
) => {
  const link = `${process.env.HOST_URL}/message/${senderId}`;
  const html = chatReplyCheckEmail(link, name, senderName);
  const data = {
    from: "Listsy <support@spyderreceipts.com>",
    to: email,
    subject: "New Message Alert on Listsy",
    html,
  };

  mailgun.messages().send(data, (error: Error, body) => {
    if (error) {
      return false;
    }
    return true;
  });
};

const addMessage = async (data: any) => {
  try {
    let newChatObj = new Chat();
    newChatObj.senderId = data.senderId;
    newChatObj.receiverId = data.receiverId;
    newChatObj.message = data.message;
    newChatObj.readState = false;
    await newChatObj.save();

    setTimeout(() => {
      // Check if a reply has been received
      checkForReply(newChatObj.id).then(async (hasReply) => {
        let chatItem = await Chat.findById(
          new mongoose.Types.ObjectId(newChatObj.id)
        )
          .populate("senderId", "firstName lastName")
          .populate("receiverId", "firstName lastName email")
          .then((model: any) => {
            if (!hasReply) {
              const email = model?.receiverId.email;
              const senderName =
                model?.senderId.firstName + " " + model?.senderId.lastName;
              const receiverName =
                model?.receiverId.firstName + " " + model?.receiverId.lastName;
              const senderId = model?.senderId._id;
              sendChatReplyEmail(email, receiverName, senderName, senderId);
            }
          });
      });
    }, 3600000);

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

export const deleteUserConversion = async (req: Request, res: Response) => {
  try {
    const curChatConnection = await ChatConnection.findOneAndDelete({
      $or: [
        {
          fromUserId: new mongoose.Types.ObjectId(req.body.fromUserId),
          toUserId: new mongoose.Types.ObjectId(req.body.toUserId),
        },
        {
          fromUserId: new mongoose.Types.ObjectId(req.body.toUserId),
          toUserId: new mongoose.Types.ObjectId(req.body.fromUserId),
        },
      ],
    });
    if (!curChatConnection) {
      return res.json({
        success: false,
        message: "Error found",
      });
    }
    const deletedChatMsg = await Chat.deleteMany({
      $or: [
        {
          senderId: new mongoose.Types.ObjectId(req.body.fromUserId),
          receiverId: new mongoose.Types.ObjectId(req.body.toUserId),
        },
        {
          senderId: new mongoose.Types.ObjectId(req.body.toUserId),
          receiverId: new mongoose.Types.ObjectId(req.body.fromUserId),
        },
      ],
    });
    return res.json({
      success: true,
      message: "Successfully deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found",
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
