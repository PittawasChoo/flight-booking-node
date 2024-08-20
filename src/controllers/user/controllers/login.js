import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { SECRET_KEY } from "#config/config";
import { pool } from "#config/dbConfig";

// Login
export async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const userQueryResult = await pool.query('SELECT * FROM "Users" WHERE "username" = $1', [
            username,
        ]);
        const user = userQueryResult.rows[0];
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY);

        res.status(200).send({ token });
    } catch (err) {
        console.error("Error adding user:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
