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
exports.uploadImages = exports.getEstateInfo = exports.uploadVideo = void 0;
const Estate_1 = __importDefault(require("../models/Estate"));
const mongoose_1 = __importDefault(require("mongoose"));
const uploadVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const multerReq = req;
    if (!(multerReq === null || multerReq === void 0 ? void 0 : multerReq.file)) {
        // No file was uploaded, handle error
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
    }
    const { filename, originalname } = multerReq.file;
    const newEstate = new Estate_1.default();
    newEstate.userId = req.body.userId;
    newEstate.videoFileName = filename;
    newEstate.uploadDate = new Date();
    yield newEstate.save();
    res.json({
        success: true,
        message: "Video uploaded successfully",
        filename,
        originalname,
        model: newEstate,
    });
});
exports.uploadVideo = uploadVideo;
const getEstateInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Estate_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.videoId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (!model) {
            return res.json({
                success: false,
                message: "Error happened while loading data!",
            });
        }
        model.title = req.body.title;
        model.subTitle = req.body.subTitle;
        model.description = req.body.description;
        model.price = req.body.price;
        model.priceUnit = req.body.priceUnit;
        model.viewCount = 0;
        model.listingType = req.body.listingType;
        model.propertyType = req.body.propertyType;
        model.bedroomCount = req.body.bedroomCount;
        model.tenure = req.body.tenure;
        model.propertyCondition = req.body.propertyCondition;
        model.postCode = req.body.postCode;
        model.yearBuilt = req.body.yearBuilt;
        model.builtSurface = req.body.builtSurface;
        model.builtSurfaceUnit = req.body.builtSurfaceUnit;
        model.plotSurface = req.body.plotSurface;
        model.plotSurfaceUnit = req.body.plotSurfaceUnit;
        model.keyFeatures = req.body.keyFeatures;
        model.nearestAttraction = req.body.nearestAttraction;
        model.facilities = req.body.facilities;
        yield model.save();
        return res.json({
            success: true,
            message: "successfully loaded real estate video information",
        });
    }));
});
exports.getEstateInfo = getEstateInfo;
const uploadImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Estate_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.videoId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
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
