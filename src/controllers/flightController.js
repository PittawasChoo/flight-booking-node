import { v4 as uuid } from "uuid";
import { addDays, getTimeDiff, formatToDate } from "../modules/date.js";

import { pool } from "../config/dbConfig.js";

const getAirportData = async (airportId) => {
    const query = 'SELECT * FROM "Airports" WHERE id = $1';
    const result = await pool.query(query, [airportId]);
    return result.rows[0];
};

const getAirlineData = async (airlineId) => {
    const query = 'SELECT * FROM "Airlines" WHERE id = $1';
    const result = await pool.query(query, [airlineId]);
    return result.rows[0];
};

const enhanceFlightData = async (flight) => {
    try {
        const originalAirportData = await getAirportData(flight.originalAirportId);
        const destinationAirportData = await getAirportData(flight.destinationAirportId);
        const airlineData = await getAirlineData(flight.airlineId);

        return {
            ...flight,

            originalAirportName: originalAirportData.airportName,
            originalAirportCode: originalAirportData.airportCode,
            originalAirportCountry: originalAirportData.countryName,

            destinationAirportName: destinationAirportData.airportName,
            destinationAirportCode: destinationAirportData.airportCode,
            destinationAirportCountry: destinationAirportData.countryName,

            airlineName: airlineData.airlineName,
            airlineLogo: airlineData.logoUrl,
        };
    } catch (err) {
        console.error("Error to enhance flight data:", err.message);
        throw err;
    }
};

// Get related flights
export async function searchFlights(req, res) {
    try {
        const { originalAirportCode, destinationAirportCode, departureDate } = req.query;

        const getAirportId = async (airportCode) => {
            const query = 'SELECT id FROM public."Airports" WHERE "airportCode" = $1';
            const result = await pool.query(query, [airportCode]);
            return result.rows[0]?.id;
        };

        const originalAirportId = await getAirportId(originalAirportCode);
        const destinationAirportId = await getAirportId(destinationAirportCode);

        if (!originalAirportId || !destinationAirportId) {
            return res.status(400).json({ message: "Invalid airport codes" });
        }

        // limit arrival date (must arrive destination by the next day)
        const limitArrivalDate = addDays(departureDate, 1);

        // get related flights
        const relatedFlightsQuery = `
            SELECT * FROM public."Flights"
            WHERE ("originalAirportId" = $1 OR "destinationAirportId" = $2)
            AND (DATE("departureDate") = $3 OR DATE("arrivalDate") = $4)
        `;
        const relatedFlightsResult = await pool.query(relatedFlightsQuery, [
            originalAirportId,
            destinationAirportId,
            departureDate,
            limitArrivalDate,
        ]);
        const allRelatedFlights = relatedFlightsResult.rows;

        const searchResult = await Promise.all(
            allRelatedFlights.map(async (flight) => {
                // if original and destination match = it is direct flight.
                if (
                    flight.originalAirportId === originalAirportId &&
                    flight.destinationAirportId === destinationAirportId
                ) {
                    return [[await enhanceFlightData(flight)]];
                } else if (flight.originalAirportId === originalAirportId) {
                    // if flight depart from the original that day but not arrive at destination = possible to be flight with stops
                    const connectableFlights = allRelatedFlights.filter((relatedFlight) => {
                        const connectingTime = getTimeDiff(
                            formatToDate(flight.arrivalDate),
                            flight.arrivalTime,
                            formatToDate(relatedFlight.departureDate),
                            relatedFlight.departureTime
                        );

                        return (
                            relatedFlight.originalAirportId === flight.destinationAirportId &&
                            relatedFlight.destinationAirportId === destinationAirportId &&
                            connectingTime >= 60
                        );
                    });

                    return await Promise.all(
                        connectableFlights.map(async (connectedFlight) => [
                            await enhanceFlightData(flight),
                            await enhanceFlightData(connectedFlight),
                        ])
                    );
                }
            })
        );

        const filteredSearchResult = searchResult.flat().filter(Boolean);

        res.json(filteredSearchResult);
    } catch (err) {
        console.error("Error getting flights search result:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}
