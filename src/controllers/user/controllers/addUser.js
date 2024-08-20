import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

import { pool } from "#config/dbConfig";

const SALT_ROUNDS = 10;

// Hash a password
const hashPassword = async (password) => {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (err) {
        console.error("Error hashing password:", err);
        throw new Error("Error hashing password");
    }
};

// Add user (No UI for this function)
export async function addUser(req, res) {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const existingUsersQueryResult = await pool.query(
            'SELECT * FROM "Users" WHERE "username" = $1',
            [username]
        );
        const existingUsers = existingUsersQueryResult.rows;

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "This username is already taken" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert user
        const insetUserQuery = `
            INSERT INTO "Users"(id, "username", "password", "email")
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(insetUserQuery, [uuid(), username, hashedPassword, email]);

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error("Error adding user:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
