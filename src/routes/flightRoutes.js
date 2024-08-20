import express from "express";

import { addFlight, searchFlights } from "#controllers/flight/controllers";

const router = express.Router();

router.post("/add-flight", addFlight);
router.get("/search", searchFlights);

export default router;
