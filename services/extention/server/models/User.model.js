import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        match: /.+@.+\..+/,
        lowercase: true,
        index: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    }
})

export const User = mongoose.model("User", userSchema);