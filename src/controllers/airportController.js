import { pool } from "../config/dbConfig.js";

// Get All Airports
export async function getAllAirports(req, res) {
    try {
        const result = await pool.query('SELECT * FROM "Airports"');
        res.json(result.rows);
    } catch (err) {
        console.error("Error getting airports data:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}
