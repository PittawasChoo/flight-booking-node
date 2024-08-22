import bcrypt from "bcrypt";

import { generateToken } from "#utils/encryptions/jwtEncryptions";
import { pool } from "#config/dbConfig";

// Login
export async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        console.log(chalk.red(`Username and password are required`));
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const userQueryResult = await pool.query('SELECT * FROM "Users" WHERE "username" = $1', [
            username,
        ]);
        const user = userQueryResult.rows[0];
        if (!user) {
            console.log(chalk.red("Invalid username or password."));
            return res.status(400).json({ message: "Invalid username or password." });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log(chalk.red("Invalid username or password."));
            return res.status(400).json({ message: "Invalid username or password." });
        }

        const token = generateToken(user);

        console.log(chalk.magenta(`Login successfully`));
        res.status(200).send({ token });
    } catch (err) {
        console.log(chalk.red(`Error logging in: ${err.message}`));
        res.status(500).json({ message: "Internal server error" });
    }
}
