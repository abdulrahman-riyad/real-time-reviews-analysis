import { User } from "../models/User.model.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", authMiddleware, async (request, response) => {
    try {
        const user = await User.findById(request.user.userId);
        if (!user) {
            return response.status(404).send({ message: "User not found" });
        }
        response.status(200).send({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
        });
    } catch (err) {
        console.error("Error happened", err);
        response.status(500).send({ message: "Server Error" });
    }
});

router.post("/register", async (request, response) => {
    const data = request.body;
    try {
        const {
            firstname,
            lastname,
            email,
            password
        } = data;
        const hash = await bcrypt.hash(password, 10);
        await User.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            passwordHash: hash
        });
        response.status(201).send({message: "User created successfully"});
    } catch (err) {
        console.error("Error happened", err);
        response.status(500).send({message: "Server Error" });
    }
});

router.post("/login", async (request, response) => {
    const data = request.body;
    try {
        const { email, password } = data;
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user) {
            return response.status(401).send({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return response.status(401).send({ message: "Invalid email or password" });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email, user_firstname: user.firstname },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        response.cookie("token", token, { maxAge: 3600000 });
        response.status(200).send({ message: "Login successful", token: token });
    } catch (err) {
        console.error("Error happened", err);
        response.status(500).send({ message: "Server Error" });
    }
});

router.get("/logout", (request, response) => {
    response.clearCookie("token");
    response.status(200).send({ message: "Logout successful" });
});

router.delete("/", authMiddleware, async (request, response) => {
    try {
        await User.findByIdAndDelete(request.user.userId);
        response.clearCookie("token");
        response.status(200).send({ message: "User deleted successfully" });        
    } catch (err) {
        console.error("Error happened", err);
        response.status(500).send({ message: "Server Error" });
    }
});

export default router;