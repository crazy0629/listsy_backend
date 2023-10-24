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
exports.cancelUpload = exports.uploadImages = exports.uploadAd = void 0;
const Ad_1 = __importDefault(require("../models/Ad"));
const Estate_1 = __importDefault(require("../models/Estate"));
const mongoose_1 = __importDefault(require("mongoose"));
const uploadAd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const multerReq = req;
    if (!(multerReq === null || multerReq === void 0 ? void 0 : multerReq.file)) {
        // No file was uploaded, handle error
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
    }
    const { filename, originalname } = multerReq.file;
    const newAd = new Ad_1.default();
    newAd.fileType = req.body.fileType;
    newAd.adFileName = "/uploads/ads/" + filename;
    newAd.uploadDate = new Date();
    yield newAd.save();
    res.json({
        success: true,
        message: "Ad is uploaded successfully",
        filename,
        originalname,
        model: newAd,
    });
});
exports.uploadAd = uploadAd;
const uploadImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Ad_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.videoId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (!model) {
            return res.json({
                success: false,
                message: "Error happened while loading data!",
            });
        }
        const multerReq = req;
        let imageNames = [];
        for (let index = 0; index < multerReq.files.length; index++) {
            const { fileName, originalname } = multerReq.files[index];
            imageNames.push(fileName);
        }
        model.imagesFileName = imageNames;
        yield model.save();
        return res.json({
            success: true,
            message: "Images are successfully uploaded",
        });
    }));
});
exports.uploadImages = uploadImages;
const cancelUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Ad_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.videoId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (!model) {
            return res.json({
                success: false,
                message: "Error happened while getting data!",
            });
        }
        const adObj = yield Ad_1.default.deleteOne({ id: req.body.videoId });
        if (!adObj) {
            return res.json({ success: false, message: "Ad not exist" });
        }
        if (req.body.adType == "estate") {
            const estateObj = yield Estate_1.default.deleteOne({ adId: req.body.videoId });
            if (!estateObj) {
                return res.json({
                    success: false,
                    message: "Erro found while canceling upload!",
                });
            }
        }
        return res.json({
            success: true,
            message: "Upload is cancelled successfully",
        });
    }));
});
exports.cancelUpload = cancelUpload;
