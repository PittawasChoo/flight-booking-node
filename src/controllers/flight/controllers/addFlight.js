import { v4 as uuid } from "uuid";

import { pool } from "#config/dbConfig";

// Add new flight (No UI for this function)
export async function addFlight(req, res) {
    const {
        originalAirportCode,
        destinationAirportCode,
        departDT,
        arrivalDT,
        airlineName,
        flightCode,
        price,
    } = req.body;

    try {
        // get original airport data
        const originalAirportQueryResult = await pool.query(
            'SELECT * FROM public."Airports" WHERE "airportCode" = $1',
            [originalAirportCode]
        );
        const originalAirport = originalAirportQueryResult.rows;
        if (!originalAirport) {
            return res.status(404).json({ message: "Original airport not found" });
        }
        const originalAirportId = originalAirport[0].id;

        // get destination airport data
        const destinationAirportQueryResult = await pool.query(
            'SELECT * FROM "Airports" WHERE "airportCode" = $1',
            [destinationAirportCode]
        );
        const destinationAirport = destinationAirportQueryResult.rows;
        if (!destinationAirport) {
            return res.status(404).json({ message: "Destination airport not found" });
        }
        const destinationAirportId = destinationAirport[0].id;

        // get airline data
        const airlineQueryResult = await pool.query(
            'SELECT * FROM "Airlines" WHERE "airlineName" = $1',
            [airlineName]
        );
        const airline = airlineQueryResult.rows;
        if (!destinationAirport) {
            console.log("Error getting airline data: Airline not found");
            return res.status(404).json({ message: "Internal server error" });
        }
        const airlineId = airline[0].id;

        // check duplication
        const flightSearch = await pool.query(
            `SELECT * FROM "Flights"
            WHERE "originalAirportId" = $1
            AND "destinationAirportId" = $2
            AND "flightCode" = $3
            AND "departureDateTime" = $4
            AND "arrivalDateTime" = $5`,
            [originalAirportId, destinationAirportId, flightCode, departDT, arrivalDT]
        );
        const flights = flightSearch.rows;

        if (flights.length > 0) {
            console.log("Error adding flight: This flight is already exist");
            return res.status(409).json({ message: "This flight is already exist" });
        }

        const result = await pool.query(
            `INSERT INTO "Flights"(
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, 100, $8)`,
            [
                uuid(),
                originalAirportId,
                destinationAirportId,
                departDT,
                arrivalDT,
                airlineId,
                flightCode,
                price,
            ]
        );

        res.status(201).json({ message: "Flight added successfully" });
    } catch (err) {
        console.error("Error adding flight data:", err.message);
        res.status(500).json({ message: "Internal Server error" });
    }
}
