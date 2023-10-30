import { Response, Request } from "express";
import Chat from "../models/Chat";

export const addMessage = async (req: Request, res: Response) => {
  let newChatObj = new Chat();
  newChatObj.senderId = req.body.senderId;
  newChatObj.receiverId = req.body.receiverId;
  newChatObj.message = req.body.message;
  newChatObj.sentDate = req.body.sentDate;
};
