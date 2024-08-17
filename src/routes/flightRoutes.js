import express from "express";
import { searchFlights } from "../controllers/flightController.js";

const router = express.Router();

// Route for user registration
router.get("/search", searchFlights);

export default router;
