import express from "express";
import { getAllAirports } from "../controllers/airportController.js";

const router = express.Router();

// Route for user registration
router.get("/all", getAllAirports);

export default router;
