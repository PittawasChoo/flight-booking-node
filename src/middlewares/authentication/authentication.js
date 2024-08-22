import { verifyToken } from "#utils/encryptions/jwtEncryptions";

// Middleware function to authenticate JWT
const authenticateToken = (req, res, next) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Assuming "Bearer <token>"

    if (token == null) return res.status(401).json({ message: "Token not provided" });

    // Verify the token
    verifyToken(
        token,
        () => {
            return res.status(403).json({ message: "Invalid token" });
        },
        (user) => {
            req.user = user; // Attached user information to the request object
            next(); // Proceed to the next middleware or route handler
        }
    );
};

export default authenticateToken;
