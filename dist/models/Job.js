"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Create a new Schema from mongoose
 */
const JobSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    jobTitle: { type: String },
    jobDescription: { type: String },
    postDate: { type: Date },
    price: { type: Number },
    priceUnit: { type: String },
    fixedPrice: { type: Boolean },
    workTimeType: { type: String },
    workRemoteType: { type: String },
    jobIndustry: { type: String },
}, { timestamps: true });
/**
 * IJob Interface Document class inheritance
 */
exports.default = (0, mongoose_1.model)("Job", JobSchema);
