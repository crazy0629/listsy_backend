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
exports.uploadJob = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const uploadJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newJob = new Job_1.default();
        newJob.userId = req.body.userId;
        newJob.jobTitle = req.body.jobTitle;
        newJob.jobDescription = req.body.jobDescription;
        newJob.postDate = new Date();
        newJob.price = req.body.price;
        newJob.priceUnit = req.body.priceUnit;
        newJob.fixedPrice = req.body.fixedPrice;
        newJob.workTimeType = req.body.workTimeType;
        newJob.workRemoteType = req.body.workRemoteType;
        newJob.jobIndustry = req.body.jobIndustry;
        yield newJob.save();
        return res.json({ success: true, message: "Job is successfully uploaded" });
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Error happened while uploading job",
        });
    }
});
exports.uploadJob = uploadJob;
