import express from "express";

import authenticateToken from "#middlewares/authentication/authentication";
import { bookFlight, readData } from "#controllers/booking/controllers";

const router = express.Router();

router.get("/read", readData);

router.post("/book", authenticateToken, bookFlight);

export default router;
