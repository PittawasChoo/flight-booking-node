import chalk from "chalk";

import { pool } from "#config/dbConfig";

// Get all airports
export async function getAllAirports(req, res) {
    try {
        const result = await pool.query('SELECT * FROM "Airports"');
        console.log(chalk.magenta(`Airport data is now sent. Please check the response data`));
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(chalk.red(`Error getting airports data: ${err.message}`));
        res.status(500).json({ message: "Internal server error" });
    }
}
