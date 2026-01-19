import express from 'express';
import cors from 'cors';
import dotenv  from "dotenv";
import morgan  from "morgan";
import cookieParser from 'cookie-parser';

import {connectDB} from "./config/db.js";

import userRouter from './controllers/user.controller.js';
import reviewRouter from './controllers/review.controller.js';
import authMiddleware from './middlewares/authMiddleware.js';

dotenv.config();
const port = process.env.PORT || 3000;

// Connect to Database
await connectDB();

const app = express();
app.use(cors({
    origin: 
    [
        'http://localhost:5173', 
        'chrome-extension://hnkmhkmhdddfbhakmbgogilnggjjfiio'
    ],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.get('/', (req, res) => {
    res.send('Welcome to the Text Summarization API');
})

app.use('/users', userRouter);
app.use('/reviews', authMiddleware, reviewRouter);

app.listen(port, () => {
    console.log("Server listening on port %s", port);
})