import express from "express";
import { addNewFlight, getAllAirports } from "../controllers/airportController.js";

const router = express.Router();

// Route for user registration
router.get("/", getAllAirports);
router.get("/all", getAllAirports);
router.post("/add-flight", addNewFlight);

export default router;
