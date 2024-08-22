import chalk from "chalk";

import { addDays, combineDateTime, getTimeDiff } from "#modules/date";
import { pool } from "#config/dbConfig";

// API can find connecting flight up to 2 stops (3 flight) per route
const STOPS_LIMIT_PER_ROUTES = 2;

// API can find connecting flight within 1 day after departure date
const EXTRA_DAYS_UNTIL_ARRIVE = 1;

// Get data from id
const getDataFromId = async (table, airportId) => {
    const query = `SELECT * FROM "${table}" WHERE id = $1`;
    const result = await pool.query(query, [airportId]);
    return result.rows[0];
};

// Enhance flight data with related airport and airline information
const enhanceFlightData = async (flight) => {
    try {
        const originalAirportData = await getDataFromId("Airports", flight.originalAirportId);
        const destinationAirportData = await getDataFromId("Airports", flight.destinationAirportId);
        const airlineData = await getDataFromId("Airlines", flight.airlineId);

        const departureDateTime = combineDateTime(flight.departureDate, flight.departureTime);
        const arrivalDateTime = combineDateTime(flight.arrivalDate, flight.arrivalTime);
        const duration = getTimeDiff(departureDateTime, arrivalDateTime);

        return {
            ...flight,

            originalAirportName: originalAirportData.airportName,
            originalAirportCode: originalAirportData.airportCode,
            originalAirportCity: originalAirportData.cityName,
            originalAirportCountry: originalAirportData.countryName,

            destinationAirportName: destinationAirportData.airportName,
            destinationAirportCode: destinationAirportData.airportCode,
            destinationAirportCity: destinationAirportData.cityName,
            destinationAirportCountry: destinationAirportData.countryName,

            departureDateTime,
            arrivalDateTime,
            duration,

            airlineName: airlineData.airlineName,
            airlineLogo: airlineData.logoUrl,
        };
    } catch (err) {
        console.error("Error enhancing flight data:", err.message);
        throw err;
    }
};

// Fetch airport ID by code
const getAirportIdByCode = async (airportCode) => {
    const query = 'SELECT id FROM "Airports" WHERE "airportCode" = $1';
    const { rows } = await pool.query(query, [airportCode]);
    return rows[0]?.id;
};

// Find connectable flights
const findConnectableFlight = (
    previousFlight,
    stopsCount,
    destinationAirportId,
    allRelatedFlights
) => {
    if (stopsCount > STOPS_LIMIT_PER_ROUTES) {
        return [];
    }

    const connectableFlights = allRelatedFlights.filter((nextFlight) => {
        const previousFlightArrivalDateTime = combineDateTime(
            previousFlight.arrivalDate,
            previousFlight.arrivalTime
        );
        const nextFlightDepartureDateTime = combineDateTime(
            nextFlight.departureDate,
            nextFlight.departureTime
        );
        const connectingTime = getTimeDiff(
            previousFlightArrivalDateTime,
            nextFlightDepartureDateTime
        );

        return (
            previousFlight.destinationAirportId === nextFlight.originalAirportId &&
            connectingTime >= 60 &&
            connectingTime <= 600
        );
    });

    if (connectableFlights.length === 0) {
        return [];
    }

    const mappedRoutes = connectableFlights.map((connectableFlight) => {
        if (connectableFlight.destinationAirportId === destinationAirportId) {
            return [[previousFlight, connectableFlight]];
        }

        const nextRoutes = findConnectableFlight(
            connectableFlight,
            stopsCount + 1,
            destinationAirportId,
            allRelatedFlights
        );
        return nextRoutes.map((route) => [previousFlight, ...route]);
    });

    return mappedRoutes.flat();
};

// Search flights
export async function searchFlights(req, res) {
    const { originalAirportCode, destinationAirportCode, departureDate } = req.query;

    try {
        const originalAirportId = await getAirportIdByCode(originalAirportCode);
        const destinationAirportId = await getAirportIdByCode(destinationAirportCode);

        if (!originalAirportId || !destinationAirportId) {
            console.log(chalk.red("Invalid airport codes"));
            return res.status(400).json({ message: "Invalid airport codes" });
        }

        // limit arrival date (must arrive destination by the next day)
        const limitArrivalDate = addDays(departureDate, EXTRA_DAYS_UNTIL_ARRIVE);

        // get related flights
        const relatedFlightsQuery = `
            SELECT * FROM public."Flights"
            WHERE "departureDate" between $1 and $2
            AND "arrivalDate" between $1 and $2
        `;
        const relatedFlightsResult = await pool.query(relatedFlightsQuery, [
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
                    const enhancedFlight = await enhanceFlightData(flight);
                    const duration = getTimeDiff(
                        enhancedFlight.departureDateTime,
                        enhancedFlight.arrivalDateTime
                    );

                    return {
                        flights: [enhancedFlight],
                        duration,
                        price: flight.price,
                        departure: enhancedFlight.departureDateTime,
                        arrival: enhancedFlight.arrivalDateTime,
                    };
                } else if (
                    flight.originalAirportId === originalAirportId &&
                    flight.departureDate === departureDate
                ) {
                    // if flight depart from the original that day but not arrive at destination = possible to have connectableFlight
                    const connectedRoutes = findConnectableFlight(
                        flight,
                        1,
                        destinationAirportId,
                        allRelatedFlights
                    );

                    if (connectedRoutes.length === 0) return;

                    const enhancedConnectedRoutes = await Promise.all(
                        connectedRoutes.map(
                            async (route) => await Promise.all(route.map(enhanceFlightData))
                        )
                    );

                    return enhancedConnectedRoutes.map((route) => {
                        const departureDateTime = route[0].departureDateTime;
                        const arrivalDateTime = route[route.length - 1].arrivalDateTime;
                        const duration = getTimeDiff(departureDateTime, arrivalDateTime);
                        const price = route.reduce((total, { price }) => total + Number(price), 0);

                        return {
                            flights: route,
                            duration: duration,
                            price,
                            departure: departureDateTime,
                            arrival: arrivalDateTime,
                        };
                    });
                }
            })
        );

        const filteredSearchResult = searchResult.flat().filter(Boolean);

        console.log(chalk.magenta(`Search result is now sent. Please check the response data`));
        res.status(200).json(filteredSearchResult);
    } catch (err) {
        console.log(chalk.red(`Error getting flights search result: ${err.message}`));
        res.status(500).json({ message: "Internal Server error" });
    }
}
