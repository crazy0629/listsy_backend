import { Router } from "express";
import * as auth from "../controllers/auth.controller";

/**
 * Router
 * Using Passport
 */

const router = Router();

// Authentication
router.post("/auth/signin", auth.signIn);
router.post("/auth/signup", auth.signUp);
router.post("/auth/resendVeriEmail", auth.resendVeriEmail);

export default router;
