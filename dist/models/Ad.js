"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Create a new Schema from mongoose
 */
const AdSchema = new mongoose_1.Schema({
    fileType: { type: String },
    adFileName: { type: String },
    imagesFileName: { type: Array },
    uploadDate: { type: Date },
}, { timestamps: true });
/**
 * IAd Interface Document class inheritance
 */
exports.default = (0, mongoose_1.model)("Ad", AdSchema);
