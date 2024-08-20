import { pool } from "#config/dbConfig";

// Get all airports
export async function getAllAirports(req, res) {
    try {
        const result = await pool.query('SELECT * FROM "Airports"');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error getting airports data:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
