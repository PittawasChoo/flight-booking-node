import express from "express";

import authenticateToken from "#middlewares/authentication/authentication";
import { addFlight, searchFlights, searchRoute } from "#controllers/flight/controllers";

const router = express.Router();

router.get("/route", authenticateToken, searchRoute);
router.get("/search", searchFlights);

router.post("/add-flight", addFlight);

export default router;
