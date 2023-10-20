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
exports.deleteCommunity = exports.getMoreCommunity = exports.getLatesetCommunity = exports.addCommunity = void 0;
const Community_1 = __importDefault(require("../models/Community"));
const addCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCommunity = new Community_1.default();
        newCommunity.userId = req.body.userId;
        newCommunity.title = req.body.title;
        newCommunity.postDate = req.body.postDate;
        yield newCommunity.save();
        const latestCommunity = yield Community_1.default.find()
            .populate("userId", "firstName lastName avatar reviewCount reviewMark")
            .sort({ postDate: -1 })
            .limit(6);
        res.json({
            success: true,
            message: "Community is sucessfully added!",
            model: latestCommunity,
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: "Error happened while adding new community!",
        });
    }
});
exports.addCommunity = addCommunity;
const getLatesetCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const latestCommunity = yield Community_1.default.find()
            .populate("userId", "firstName lastName avatar")
            .sort({ postDate: -1 })
            .limit(6);
        if (!latestCommunity) {
            return res.json({ success: false, message: "Community not exist" });
        }
        return res.json({
            success: true,
            message: "Successfully loaded!",
            data: latestCommunity,
        });
    }
    catch (error) {
        return res.json({
            success: false,
            message: "Error found while loading community",
        });
    }
});
exports.getLatesetCommunity = getLatesetCommunity;
const getMoreCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const condition = {
        title: { $regex: req.body.searchString, $options: "i" },
    };
    try {
        let latestCommunity;
        if (req.body.searchString == "") {
            latestCommunity = yield Community_1.default.find()
                .populate("userId", "firstName lastName avatar reviewCount reviewMark")
                .sort({ postDate: -1 })
                .skip(req.body.index * 20)
                .limit(20);
        }
        else {
            latestCommunity = yield Community_1.default.find(condition)
                .populate("userId", "firstName lastName avatar reviewCount reviewMark")
                .sort({ postDate: -1 })
                .skip(req.body.index * 20)
                .limit(20);
        }
        return res.json({
            success: true,
            message: "Successfully loaded!",
            data: latestCommunity,
        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Error found while loading more community",
        });
    }
});
exports.getMoreCommunity = getMoreCommunity;
const deleteCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community = yield Community_1.default.deleteOne({
            userId: req.body.userId,
            title: req.body.title,
        });
        if (!community) {
            return res.json({ success: false, message: "Community not exist" });
        }
        return res.json({ success: true, message: "Successfully deleted!" });
    }
    catch (error) {
        return res.json({
            success: false,
            message: "Error found while deleting community",
        });
    }
});
exports.deleteCommunity = deleteCommunity;
