"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Create a new Schema from mongoose
 */
const CommunitySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, require: true },
    postDate: { type: Date, require: true },
}, { timestamps: true });
/**
 * ICommunity Interface Document class inheritance
 */
exports.default = (0, mongoose_1.model)("Community", CommunitySchema);
