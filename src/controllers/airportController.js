import { v4 as uuid } from "uuid";
import { pool } from "../config/dbConfig.js";

// Get all airports
export async function getAllAirports(req, res) {
    try {
        const result = await pool.query('SELECT * FROM "Airports"');
        res.json(result.rows);
    } catch (err) {
        console.error("Error getting airports data:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}

// Add new flight
export async function addNewFlight(req, res) {
    try {
        const {
            originalAirportCode,
            destinationAirportCode,
            departDT,
            arrivalDT,
            airlineName,
            flightCode,
            price,
        } = req.body;
        // get original airport data
        const originalAirport = await pool.query(
            `SELECT * FROM public."Airports" WHERE "airportCode" = '${originalAirportCode}'`
        );
        const originalAirportId = originalAirport.rows[0].id;
        console.log("originalAirportId", originalAirportId);

        // get destination airport data
        const destinationAirport = await pool.query(
            `SELECT * FROM "Airports" WHERE "airportCode" = '${destinationAirportCode}'`
        );
        const destinationAirportId = destinationAirport.rows[0].id;
        console.log("destinationAirportId", destinationAirportId);

        // get airline data
        const airline = await pool.query(
            `SELECT * FROM "Airlines" WHERE "airlineName" = '${airlineName}'`
        );
        const airlineId = airline.rows[0].id;
        console.log("airlineId", airlineId);

        // check duplication
        const flightSearch = await pool.query(
            `SELECT * FROM "Flights"
            WHERE "originalAirportId" = '${originalAirportId}' 
            AND "destinationAirportId" = '${destinationAirportId}'
            AND "flightCode" = '${flightCode}'
            AND "departureDateTime" = '${departDT}'
            AND "arrivalDateTime" = '${arrivalDT}'`
        );
        const flights = flightSearch.rows;

        if (flights.length > 0) {
            console.log("duplicate flight");
            throw "duplicate flight";
        }

        const result = await pool.query(`INSERT INTO "Flights"(
                id,
                "originalAirportId",
                "destinationAirportId",
                "departureDateTime",
                "arrivalDateTime",
                "airlineId",
                "flightCode",
                "availableSeats",
                "price"
            )
            VALUES (
                '${uuid()}',
                '${originalAirportId}',
                '${destinationAirportId}',
                '${departDT}',
                '${arrivalDT}',
                '${airlineId}',
                '${flightCode}',
                100,
                '${price}'
            )`);
        res.json(result.rows);
    } catch (err) {
        console.error("Error adding flight data:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}

// Get flights match the recieved condition
// export async function getAllflights(req, res) {
//     try {
//         const { original, destination, date } = req.query
//         const result = await pool.query('SELECT * FROM "Flights"');
//         res.json(result.rows);
//     } catch (err) {
//         console.error("Error getting flights data:", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// }
