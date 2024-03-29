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
import * as review from "../controllers/review.controller";
import * as garden from "../controllers/garden.controller";
import * as fashion from "../controllers/fashion.controller";
import * as sports from "../controllers/sports.controller";
import * as art from "../controllers/art.controller";
import * as pet from "../controllers/pet.controller";
import * as chat from "../controllers/chat.controller";
import * as food from "../controllers/food.controller";
import * as diy from "../controllers/diy.controller";
import * as beauty from "../controllers/beauty.controller";
import * as toy from "../controllers/toys.controller";
import * as music from "../controllers/music.controller";
import * as furniture from "../controllers/furniture.controller";
import * as service from "../controllers/service.controller";
import * as userEmot from "../controllers/userEmot.controller";
import * as report from "../controllers/report.controller";

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

// Ad User Emot
router.post("/userEmot/clickEmotIcon", userEmot.clickUserEmotion);

// Ad Report
router.post("/report/reportAd", report.createReport);

// Community

router.post("/community/add", community.addCommunity);
router.post("/community/getLatest", community.getLatesetCommunity);
router.post("/community/delete", community.deleteCommunity);
router.post("/community/getMore", community.getMoreCommunity);

// Chat
// router.post("/chat/deleteConversation", chat.deleteUserConversion);

// Profile

router.post("/profile/changePhoneNumberShare", profile.changePhoneNumberShare);
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
router.post("/ad/getLocationList", ad.getLocationList);

// Real Estate

router.post("/estate/loadEstateInfo", estate.loadEstateInfo);
router.post("/estate/getAdDetailInfo", estate.getAdDetailInfo);
router.post("/estate/getCountForEachCategory", estate.getCountForEachCategory);
router.post("/estate/getEstateAds", estate.getMoreEstateAds);
router.post("/estate/getCountOfEachFilter", estate.getCountOfEachFilter);

// Toy

router.post("/toys/loadToysInfo", toy.loadToysInfo);
router.post("/toys/getAdDetailInfo", toy.getAdDetailInfo);
router.post("/toys/getCountForEachCategory", toy.getCountForEachCategory);
router.post("/toys/getToysAds", toy.getMoreToysAds);
router.post("/toys/getCountOfEachFilter", toy.getCountOfEachFilter);

// Food

router.post("/food/loadFoodInfo", food.loadFoodInfo);
router.post("/food/getAdDetailInfo", food.getAdDetailInfo);
router.post("/food/getCountForEachCategory", food.getCountForEachCategory);
router.post("/food/getFoodAds", food.getMoreFoodAds);
router.post("/food/getCountOfEachFilter", food.getCountOfEachFilter);

// Music
router.post("/music/loadMusicInfo", music.loadMusicInfo);
router.post("/music/getAdDetailInfo", music.getAdDetailInfo);
router.post("/music/getCountForEachCategory", music.getCountForEachCategory);
router.post("/music/getMusicAds", music.getMoreMusicAds);
router.post("/music/getCountOfEachFilter", music.getCountOfEachFilter);

// Beauty

router.post("/beauty/loadBeautyInfo", beauty.loadBeautyInfo);
router.post("/beauty/getAdDetailInfo", beauty.getAdDetailInfo);
router.post("/beauty/getCountForEachCategory", beauty.getCountForEachCategory);
router.post("/beauty/getBeautyAds", beauty.getMoreBeautyAds);
router.post("/beauty/getCountOfEachFilter", beauty.getCountOfEachFilter);

// Diy

router.post("/diy/loadDiyInfo", diy.loadDiyInfo);
router.post("/diy/getAdDetailInfo", diy.getAdDetailInfo);
router.post("/diy/getDiyAds", diy.getMoreDiyAds);
router.post("/diy/getCountForEachCategory", diy.getCountForEachCategory);
router.post("/diy/getCountOfEachFilter", diy.getCountOfEachFilter);

// ForSale

router.post("/sale/loadForSaleInfo", sale.loadForSaleInfo);
router.post("/sale/getForSaleAds", sale.getMoreForSaleAds);
router.post("/sale/getAdDetailInfo", sale.getAdDetailInfo);
router.post("/sale/getCountForEachCategory", sale.getCountForEachCategory);
router.post("/sale/getCountOfEachFilter", sale.getCountOfEachFilter);

// Pet

router.post("/pet/loadPetsInfo", pet.loadPetsInfo);
router.post("/pet/getAdDetailInfo", pet.getAdDetailInfo);
router.post("/pet/getPetAds", pet.getMorePetAds);
router.post("/pet/getCountForEachCategory", pet.getCountForEachCategory);
router.post("/pet/getCountOfEachFilter", pet.getCountOfEachFilter);

// Garden

router.post("/garden/loadGardenInfo", garden.loadGardenInfo);
router.post("/garden/getGardenAds", garden.getMoreGardenAds);
router.post("/garden/getAdDetailInfo", garden.getAdDetailInfo);
router.post("/garden/getCountForEachCategory", garden.getCountForEachCategory);
router.post("/garden/getCountOfEachFilter", garden.getCountOfEachFilter);

// Fashion

router.post("/fashion/loadFashionInfo", fashion.loadFashionInfo);
router.post("/fashion/getFashionAds", fashion.getMoreFashionAds);
router.post("/fashion/getAdDetailInfo", fashion.getAdDetailInfo);
router.post(
  "/fashion/getCountForEachCategory",
  fashion.getCountForEachCategory
);
router.post("/fashion/getCountOfEachFilter", fashion.getCountOfEachFilter);

// Vehicle

router.post("/truck/loadVehicleInfo", vehicle.loadVehicleInfo);
router.post("/truck/getMoreVehicleAds", vehicle.getMoreVehicleAds);
router.post("/truck/getAdDetailInfo", vehicle.getAdDetailInfo);

// Sports

router.post("/sports/loadSportsInfo", sports.loadSportsInfo);
router.post("/sports/getAdDetailInfo", sports.getAdDetailInfo);
router.post("/sports/getCountForEachCategory", sports.getCountForEachCategory);
router.post("/sports/getSportsAds", sports.getMoreSportsAds);
router.post("/sports/getCountOfEachFilter", sports.getCountOfEachFilter);

// Furniture

router.post("/furniture/loadFurnitureInfo", furniture.loadFurnitureInfo);
router.post("/furniture/getAdDetailInfo", furniture.getAdDetailInfo);
router.post(
  "/furniture/getCountForEachCategory",
  furniture.getCountForEachCategory
);
router.post("/furniture/getFurnitureAds", furniture.getMoreFurnitureAds);
router.post("/furniture/getCountOfEachFilter", furniture.getCountOfEachFilter);

// Art

router.post("/art/loadArtInfo", art.loadArtInfo);
router.post("/art/getAdDetailInfo", art.getAdDetailInfo);
router.post("/art/getCountForEachCategory", art.getCountForEachCategory);
router.post("/art/getArtAds", art.getMoreArtAds);
router.post("/art/getCountOfEachFilter", art.getCountOfEachFilter);

// Service

router.post("/services/loadServiceInfo", service.loadServiceInfo);
router.post("/services/getAdDetailInfo", service.getAdDetailInfo);
router.post(
  "/services/getCountForEachCategory",
  service.getCountForEachCategory
);
router.post("/services/getServiceAds", service.getMoreServiceAds);
router.post("/services/getCountOfEachFilter", service.getCountOfEachFilter);

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

// Review

router.post("/review/checkReviewExists", review.checkReviewExists);
router.post("/review/addReview", review.addReview);
router.post("/review/deleteReview", review.deleteReview);
router.post("/review/changeReview", review.changeReview);
router.post("/review/getAllReviews", review.getAllRviews);

export default router;
