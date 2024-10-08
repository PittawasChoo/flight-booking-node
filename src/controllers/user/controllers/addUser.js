import chalk from "chalk";
import { v4 as uuid } from "uuid";

import { hashPassword } from "#utils/hashing/hashingPassword";
import { pool } from "#config/dbConfig";

// Add user (This function is created for making mock data only, No UI or requirement for this function)
export async function addUser(req, res) {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
        console.log(chalk.red("Username and password are required"));
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const existingUsersQueryResult = await pool.query(
            'SELECT * FROM "Users" WHERE "username" = $1',
            [username]
        );
        const existingUsers = existingUsersQueryResult.rows;

        if (existingUsers.length > 0) {
            console.log(chalk.red("This username is already taken"));
            return res.status(409).json({ message: "This username is already taken" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert user
        const insetUserQuery = `
            INSERT INTO "Users"(id, "username", "password", "email", "role")
            VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(insetUserQuery, [uuid(), username, hashedPassword, email, role]);

        console.log(chalk.magenta(`User created successfully`));
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.log(chalk.red(`Error adding user: ${err.message}`));
        res.status(500).json({ message: "Internal server error" });
    }
}
