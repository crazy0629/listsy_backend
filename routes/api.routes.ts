import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import * as community from "../controllers/community.controller";
import * as profile from "../controllers/profile.controller";
import * as estate from "../controllers/estate.controller";

import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
/**
 * Router
 * Using Passport
 */

const router = Router();

const avatarDir = path.join(__dirname, "../uploads/avatar");
const adDir = path.join(__dirname, "../uploads/ads");
const extraImageDir = path.join(__dirname, "../uploads/images");

// Create a storage engine for Multer
const storage = multer.diskStorage({
  destination: avatarDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

const videoStorage = multer.diskStorage({
  destination: adDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

const imageStorage = multer.diskStorage({
  destination: extraImageDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

// Configure Multer with the storage engine
const upload = multer({ storage });
const uploadVideo = multer({ videoStorage });
const uploadImages = multer({ imageStorage });

// Authentication

router.post("/auth/signin", auth.signIn);
router.post("/auth/signup", auth.signUp);
router.post("/auth/resendVeriEmail", auth.resendVeriEmail);
router.post("/auth/forgetPassword", auth.forgetPassword);
router.post("/auth/resetPassword", auth.resetPassword);
router.post(
  "/auth/checkSignUpVerificationToken",
  auth.checkSignUpVerificationToken
);

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
router.post(
  "/estate/uploadImages",
  upload.array("images"),
  estate.uploadImages
);

export default router;
