import express from "express";

import { addUser, login } from "#controllers/user/controllers";

const router = express.Router();

router.post("/add-user", addUser);
router.post("/login", login);

export default router;
