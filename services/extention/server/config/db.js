import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.model.js";
import { Review } from "../models/Review.model.js";
dotenv.config({
    path: "../.env"
}
);


export async function connectDB(){
    try{
        mongoose.connection.on('open', async () => {
            await User.syncIndexes();
            await Review.syncIndexes();
            console.log("Indexes synchronized");
        });
        await mongoose.connect(process.env.MONGODB_URL);

        
        console.log("MongoDB connected");
    } catch (err){
        console.error("MongoDB connection failed", err);
        process.exit(1);
    }
}