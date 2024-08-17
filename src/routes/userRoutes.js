import express from "express";
import {
    register,
    login,
    getUserProfile,
    updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route for user registration
router.post("/register", register);

// Route for user login
router.post("/login", login);

// Route for getting user profile, protect middleware ensures only logged-in users can access this route
router.get("/profile", protect, getUserProfile);

// Route for updating user profile, protect middleware ensures only logged-in users can access this route
router.put("/profile", protect, updateUserProfile);

export default router;
