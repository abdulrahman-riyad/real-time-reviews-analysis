import mongoose from "mongoose";
import {
    FULFILLED,
    FAILED,
    PENDING
} from "../config/constants.js"

const { Schema } = mongoose;

const reviewSchema = new Schema({
    product_id: {
        type: String,
        index: true,
        unique: true
    },
    title: String,
    link: String,
    summary: String,
    status: {
        type: String,
        enum: [FULFILLED, PENDING, FAILED],
        default: PENDING
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

export const Review = mongoose.model("Review", reviewSchema);