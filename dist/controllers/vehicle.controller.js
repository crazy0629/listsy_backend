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
exports.uploadImages = exports.getVehicleInfo = exports.uploadVideo = void 0;
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const mongoose_1 = __importDefault(require("mongoose"));
const uploadVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const multerReq = req;
    if (!(multerReq === null || multerReq === void 0 ? void 0 : multerReq.file)) {
        // No file was uploaded, handle error
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
    }
    const { filename, originalname } = multerReq.file;
    const newVehicle = new Vehicle_1.default();
    newVehicle.userId = req.body.userId;
    newVehicle.isVideoAds = req.body.isVideo;
    newVehicle.videoFileName = filename;
    newVehicle.uploadDate = new Date();
    yield newVehicle.save();
    res.json({
        success: true,
        message: "Video uploaded successfully",
        filename,
        originalname,
        model: newVehicle,
    });
});
exports.uploadVideo = uploadVideo;
const getVehicleInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Vehicle_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.videoId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
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
        model.vehicleType = req.body.vehicleType;
        model.saleType = req.body.saleType;
        model.condition = req.body.condition;
        model.vehicleMake = req.body.vehicleMake;
        model.vehicleModel = req.body.vehicleModel;
        model.year = req.body.year;
        model.mileage = req.body.mileage;
        model.mileageUnit = req.body.mileageUnit;
        model.gearbox = req.body.gearbox;
        model.fuelType = req.body.fuelType;
        model.doors = req.body.doors;
        model.color = req.body.color;
        model.bodyType = req.body.bodyType;
        model.seat = req.body.seat;
        yield model.save();
        return res.json({
            success: true,
            message: "successfully loaded vehicle ads information",
        });
    }));
});
exports.getVehicleInfo = getVehicleInfo;
const uploadImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Vehicle_1.default.findById(new mongoose_1.default.Types.ObjectId(req.body.videoId)).then((model) => __awaiter(void 0, void 0, void 0, function* () {
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
