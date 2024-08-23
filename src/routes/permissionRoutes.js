import express from "express";

import authenticateToken from "#middlewares/authentication/authentication";
import { getAdminPagePermission } from "#controllers/permission/controllers";

const router = express.Router();

router.get("/admin-page", authenticateToken, getAdminPagePermission);

export default router;
