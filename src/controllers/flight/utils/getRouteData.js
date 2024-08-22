import { combineDateTime, getTimeDiff } from "#modules/date";
import { pool } from "#config/dbConfig";

import { validateRoute } from "./validateRoute.js";

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

export const getRouteData = async (flights) => {
    // get related flights
    const flightsQuery = `
     SELECT * FROM public."Flights"
     WHERE id = ANY($1);
 `;
    const flightsQueryResult = await pool.query(flightsQuery, [flights]);
    const flightsData = flightsQueryResult.rows;

    if (flightsData.length !== flights.length) {
        return { success: false, status: 404, errorMessage: "Flight not found" };
    }

    const validatedRoute = validateRoute(flightsData);

    if (!validatedRoute.valid) {
        return { success: false, status: 400, errorMessage: "Invalid route" };
    }

    const orderedFlights = validatedRoute.orderedFlights;
    const enhancedFlights = await Promise.all(orderedFlights.map(enhanceFlightData));

    const departureDateTime = enhancedFlights[0].departureDateTime;
    const arrivalDateTime = enhancedFlights[enhancedFlights.length - 1].arrivalDateTime;
    const duration = getTimeDiff(departureDateTime, arrivalDateTime);
    const price = enhancedFlights.reduce((total, { price }) => total + Number(price), 0);

    const routeData = {
        flights: enhancedFlights,
        duration: duration,
        price,

        departure: departureDateTime,
        arrival: arrivalDateTime,

        originalAirportCity: enhancedFlights[0].originalAirportCity,
        originalAirportCode: enhancedFlights[0].originalAirportCode,
        originalAirportName: enhancedFlights[0].originalAirportName,

        destinationAirportCity: enhancedFlights[enhancedFlights.length - 1].destinationAirportCity,
        destinationAirportCode: enhancedFlights[enhancedFlights.length - 1].destinationAirportCode,
        destinationAirportName: enhancedFlights[enhancedFlights.length - 1].destinationAirportName,
    };

    return { success: true, status: 200, data: routeData };
};
