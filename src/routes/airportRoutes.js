import express from "express";

import { getAllAirports } from "#controllers/airport/controllers";

const router = express.Router();

router.get("/", getAllAirports);
router.get("/all", getAllAirports);

export default router;
