import chalk from "chalk";
import { v4 as uuid } from "uuid";

import { pool } from "#config/dbConfig";

// Add new flight (This function is created for making mock data only, No UI or requirement for this function)
export async function addFlight(req, res) {
    const {
        originalAirportCode,
        destinationAirportCode,
        departureDate,
        departureTime,
        arrivalDate,
        arrivalTime,
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
            console.log(chalk.red(`Original airport not found`));
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
            console.log(chalk.red("Destination airport not found"));
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
            console.log(chalk.red("Airline not found"));
            return res.status(404).json({ message: "Airline not found" });
        }
        const airlineId = airline[0].id;

        // check duplication
        const flightSearch = await pool.query(
            `SELECT * FROM "Flights"
            WHERE "originalAirportId" = $1
            AND "destinationAirportId" = $2
            AND "flightCode" = $3
            AND "departureDate" = $4
            AND "departureTime" = $5
            AND "arrivalDate" = $6
            AND "arrivalTime" = $7`,
            [
                originalAirportId,
                destinationAirportId,
                flightCode,
                departureDate,
                departureTime,
                arrivalDate,
                arrivalTime,
            ]
        );
        const flights = flightSearch.rows;

        if (flights.length > 0) {
            console.log(chalk.red("This flight is already exist"));
            return res.status(409).json({ message: "This flight is already exist" });
        }

        const result = await pool.query(
            `INSERT INTO "Flights"(
                id,
                "originalAirportId",
                "destinationAirportId",
                "airlineId",
                "flightCode",
                "availableSeats",
                "price",
                "departureTime",
                "arrivalTime",
                "departureDate",
                "arrivalDate"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 ,$10 ,$11)`,
            [
                uuid(),
                originalAirportId,
                destinationAirportId,
                airlineId,
                flightCode,
                100,
                price,
                departureTime,
                arrivalTime,
                departureDate,
                arrivalDate,
            ]
        );

        console.log(chalk.magenta("Flight added successfully"));
        res.status(201).json({ message: "Flight added successfully" });
    } catch (err) {
        console.log(chalk.red(`Error adding flight data: ${err.message}`));
        res.status(500).json({ message: "Internal Server error" });
    }
}
