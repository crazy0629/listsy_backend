import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import * as community from "../controllers/community.controller";
import * as profile from "../controllers/profile.controller";

import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
/**
 * Router
 * Using Passport
 */

const router = Router();

const uploadDir = path.join(__dirname, "../uploadsAvatar");

// Create a storage engine for Multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

// Configure Multer with the storage engine
const upload = multer({ storage });

// Authentication

router.post("/auth/signin", auth.signIn);
router.post("/auth/signup", auth.signUp);
router.post("/auth/resendVeriEmail", auth.resendVeriEmail);
router.post("/auth/forgetPassword", auth.forgetPassword);
router.post("/auth/resetPassword", auth.resetPassword);

// Community

router.post("/community/add", community.addCommunity);
router.post("/community/getGroup", community.getCommunityOffset);
router.post("/community/delete", community.deleteCommunity);

// Profile

router.post("/profile/deleteAccount", profile.deleteAccount);
router.post("/profile/changePassword", profile.changePassword);
router.post("/profile/editProfile", profile.editProfile);
router.post("/profile/avatar", upload.single("avatar"), profile.setAvatar);

export default router;
