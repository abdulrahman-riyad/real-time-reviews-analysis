import jwt from "jsonwebtoken";

export default async function authMiddleware(req, res, next) {
    // either throw a cookie or header based token
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).send({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({ message: "Unauthorized" });
    }
}