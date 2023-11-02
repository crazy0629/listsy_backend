import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import * as community from "../controllers/community.controller";
import * as profile from "../controllers/profile.controller";
import * as estate from "../controllers/estate.controller";
import * as ad from "../controllers/ad.controller";
import * as vehicle from "../controllers/vehicle.controller";
import * as job from "../controllers/job.controller";
import * as proposal from "../controllers/proposal.controller";
import * as sale from "../controllers/sale.controller";
import * as chat from "../controllers/chat.controller";

import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

/**
 * Router
 * Using Passport
 */

const router = Router();

const avatar_dir = path.join(__dirname, "../uploads/avatar");
const ad_dir = path.join(__dirname, "../uploads/ads");
const extraImage_dir = path.join(__dirname, "../uploads/images");
const jobFile_dir = path.join(__dirname, "../uploads/job");
const chatFile_dir = path.join(__dirname, "../uploads/chat");

// Create a storage engine for Multer

const chatFileStorage = multer.diskStorage({
  destination: chatFile_dir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

const jobFileStorage = multer.diskStorage({
  destination: jobFile_dir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

const avatarStorage = multer.diskStorage({
  destination: avatar_dir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

const adStorage = multer.diskStorage({
  destination: ad_dir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

const imageStorage = multer.diskStorage({
  destination: extraImage_dir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

// Configure Multer with the storage engine
const uploadAvatar = multer({ storage: avatarStorage });
const uploadAds = multer({ storage: adStorage });
const uploadImages = multer({ storage: imageStorage });
const uploadJobs = multer({ storage: jobFileStorage });
const uploadChatFile = multer({ storage: chatFileStorage });

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
router.post(
  "/profile/avatar",
  uploadAvatar.single("avatar"),
  profile.setAvatar
);
router.post("/profile/getPostByUser", profile.getPostByUser);

// Ad upload

router.post("/asset/upload", uploadAds.single("ad"), ad.uploadAd);
router.post(
  "/asset/uploadImages",
  uploadImages.array("images"),
  ad.uploadImages
);
router.post("/upload/cancel", ad.cancelUpload);

// Real Estate

router.post("/estate/loadEstateInfo", estate.loadEstateInfo);
router.post("/estate/getEstateObjects", estate.getMoreEstateAds);
router.post("/estate/getAdDetailInfo", estate.getAdDetailInfo);

// ForSale Estate

router.post("/sale/loadForSaleInfo", sale.loadForSaleInfo);
router.post("/sale/getForSaleAds", sale.getMoreForSaleAds);
router.post("/sale/getAdDetailInfo", sale.getAdDetailInfo);

// Vehcile

router.post("/truck/loadVehicleInfo", vehicle.loadVehicleInfo);
router.post("/truck/getMoreVehicleAds", vehicle.getMoreVehicleAds);
router.post("/truck/getAdDetailInfo", vehicle.getAdDetailInfo);

// Job

router.post("/job/loadJobInfo", uploadJobs.array("jobFiles"), job.uploadJob);
router.post("/job/getMoreJobInfo", job.getMoreJobInfo);

// Proposal

router.post(
  "/proposal/send",
  uploadJobs.array("proposalFiles"),
  proposal.sendProposal
);
router.post("/proposal/checkIsApplied", proposal.checkIsApplied);
router.post("/proposal/getProposalListPerJob", proposal.getProposalListPerJob);

// Chat

router.post("/message/add", uploadChatFile.array("chatFiles"), chat.addMessage);
router.post("/message/addMemberOnChat", chat.addMemberOnChat);

export default router;
