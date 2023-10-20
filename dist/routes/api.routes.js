"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth = __importStar(require("../controllers/auth.controller"));
const community = __importStar(require("../controllers/community.controller"));
const profile = __importStar(require("../controllers/profile.controller"));
const estate = __importStar(require("../controllers/estate.controller"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
/**
 * Router
 * Using Passport
 */
const router = (0, express_1.Router)();
const avatarDir = path_1.default.join(__dirname, "../uploads/avatar");
const adDir = path_1.default.join(__dirname, "../uploads/ads");
const extraImageDir = path_1.default.join(__dirname, "../uploads/images");
// Create a storage engine for Multer
const storage = multer_1.default.diskStorage({
    destination: avatarDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = (0, uuid_1.v4)();
        const fileExtension = path_1.default.extname(file.originalname);
        const fileName = `${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
    },
});
const videoStorage = multer_1.default.diskStorage({
    destination: adDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = (0, uuid_1.v4)();
        const fileExtension = path_1.default.extname(file.originalname);
        const fileName = `${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
    },
});
const imageStorage = multer_1.default.diskStorage({
    destination: extraImageDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = (0, uuid_1.v4)();
        const fileExtension = path_1.default.extname(file.originalname);
        const fileName = `${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
    },
});
// Configure Multer with the storage engine
const upload = (0, multer_1.default)({ storage });
const uploadVideo = (0, multer_1.default)({ videoStorage });
const uploadImages = (0, multer_1.default)({ imageStorage });
// Authentication
router.post("/auth/signin", auth.signIn);
router.post("/auth/signup", auth.signUp);
router.post("/auth/resendVeriEmail", auth.resendVeriEmail);
router.post("/auth/forgetPassword", auth.forgetPassword);
router.post("/auth/resetPassword", auth.resetPassword);
router.post("/auth/checkSignUpVerificationToken", auth.checkSignUpVerificationToken);
// Community
router.post("/community/add", community.addCommunity);
router.post("/community/getLatest", community.getLatesetCommunity);
router.post("/community/delete", community.deleteCommunity);
router.post("/community/getMore", community.getMoreCommunity);
// Profile
router.post("/profile/deleteAccount", profile.deleteAccount);
router.post("/profile/changePassword", profile.changePassword);
router.post("/profile/editProfile", profile.editProfile);
router.post("/profile/avatar", upload.single("avatar"), profile.setAvatar);
// Real Estate Video
router.post("/estate/uploadAd", uploadVideo.single("ad"), estate.uploadAd);
router.post("/estate/getEstateInfo", estate.getEstateInfo);
router.post("/estate/uploadImages", upload.array("images"), estate.uploadImages);
exports.default = router;
