"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.deleteAccount = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const deleteAccount = (req, res) => {
    User_1.default.findByIdAndDelete(new mongoose_1.default.Types.ObjectId(req.body.userId)).then((model) => {
        if (!model)
            return res.json({
                success: false,
                message: "Error happend why deleting your account!",
            });
        res.json({ success: true, model });
    });
};
exports.deleteAccount = deleteAccount;
const changePassword = (req, res) => {
    User_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.userId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (!model) {
            return res.json({
                success: false,
                message: "Error happened while changing your password!",
            });
        }
        const isMatch = yield bcrypt_1.default.compare(req.body.prevPassword, model.password);
        if (!isMatch) {
            return res.json({
                success: false,
                message: "Your previous password is not correct",
            });
        }
        model.password = req.body.newPassword;
        yield model.save();
        return res.json({
            success: true,
            message: "Password is successfully changed",
        });
    }));
};
exports.changePassword = changePassword;
