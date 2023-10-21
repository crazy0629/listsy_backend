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
exports.changePassword = exports.deleteAccount = exports.editProfile = exports.setAvatar = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const helper_1 = require("../service/helper");
const setAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    User_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.userId))
        .then((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (user) {
            const multerReq = req;
            if (!(multerReq === null || multerReq === void 0 ? void 0 : multerReq.file)) {
                // No file was uploaded, handle error
                res.status(400).json({ success: false, message: "No file uploaded" });
                return;
            }
            if (user.avatar) {
                const prevAvatarPath = path_1.default.join(__dirname, "/.." + user.avatar);
                fs_1.default.unlink(prevAvatarPath, (err) => {
                    if (err) {
                        console.error("Error deleting file:", err);
                    }
                    console.log("File deleted successfully");
                });
            }
            // Access the uploaded file using req.file
            const { filename, originalname } = multerReq.file;
            user.avatar = "/uploads/avatar/" + filename;
            yield user.save();
            // Process the file as needed (e.g., save the filename to the user's profile)
            res.json({
                success: true,
                message: "Avatar uploaded successfully",
                data: user,
                token: (0, helper_1.generateToken)(user),
            });
        }
        else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    }))
        .catch((error) => {
        console.error("Database error:", error);
        res.status(500).json({ success: false, message: "An error occurred" });
    });
});
exports.setAvatar = setAvatar;
const editProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    User_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.userId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (!model) {
            return res.json({
                success: false,
                message: "Error happened while changing setting your profile!",
            });
        }
        model.firstName = req.body.firstName;
        model.lastName = req.body.lastName;
        model.userName = req.body.userName;
        model.bio = req.body.bio;
        model.telephoneNumber = req.body.telephoneNumber;
        // model.addressCity = req.body.addressCity;
        // model.addressCountry = req.body.addressCountry;
        yield model.save();
        return res.json({
            success: true,
            message: "Your profile is successfully edited",
            data: model,
            token: (0, helper_1.generateToken)(model),
        });
    }));
});
exports.editProfile = editProfile;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    User_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.userId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (!model) {
            return res.json({
                success: false,
                message: "Error happend why deleting your account!",
            });
        }
        const isMatch = yield bcrypt_1.default.compare(req.body.password, model.password);
        if (!isMatch) {
            return res.json({
                success: false,
                message: "Your password is not correct",
            });
        }
        User_1.default.findByIdAndDelete(new mongoose_1.default.Types.ObjectId(req.body.userId)).then((model) => {
            return res.json({
                success: true,
                message: "Your account is successfully deleted!",
            });
        });
    }));
});
exports.deleteAccount = deleteAccount;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.changePassword = changePassword;
