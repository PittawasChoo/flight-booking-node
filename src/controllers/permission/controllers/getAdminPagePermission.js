import chalk from "chalk";

import { pool } from "#config/dbConfig";

const ALLOWED_ROLES = ["admin"];

// Get permission to access admin page
export async function getAdminPagePermission(req, res) {
    const userId = req.user.id;
    console.log("req.user", req.user);
    console.log("userId", userId);
    try {
        const userDataQueryResult = await pool.query('SELECT * FROM "Users" WHERE "id" = $1', [
            userId,
        ]);
        if (userDataQueryResult.rows.length !== 1) {
            console.log(chalk.red(`Invalid user id`));
            return res.status(404).json({ message: "Invalid user id" });
        }

        const user = userDataQueryResult.rows[0];
        const permission = {
            allowAccess: ALLOWED_ROLES.includes(user.role),
        };

        console.log(chalk.magenta(`User permission is now sent. Please check the response data`));
        res.status(200).json(permission);
    } catch (err) {
        console.log(chalk.red(`Error adding user: ${err.message}`));
        res.status(500).json({ message: "Internal server error" });
    }
}
