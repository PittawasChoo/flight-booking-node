import chalk from "chalk";
import { v4 as uuid } from "uuid";

import { encryptContact } from "#utils/encryptions/contactEncryptions";
import { encryptPassenger } from "#utils/encryptions/passengerEncryptions";
import { encryptPayment } from "#utils/encryptions/paymentEncryptions";
import { pool } from "#config/dbConfig";
import { PORT } from "#config/config";
import { validateRoute } from "#controllers/flight/utils/validateRoute";

// Store booking data
export async function bookFlight(req, res) {
    const { contact, passengers, payment, flights } = req.body;
    const userId = req.user.id;

    try {
        const bookingId = uuid();
        const encryptedContactData = encryptContact(contact);
        const encryptedPassengersData = encryptPassenger({ passengers: passengers });
        const encryptedPaymentData = encryptPayment(payment);

        // get related flights
        const flightsQuery = `
            SELECT * FROM public."Flights"
            WHERE id = ANY($1);
        `;
        const flightsQueryResult = await pool.query(flightsQuery, [flights]);
        const flightsData = flightsQueryResult.rows;
        if (flightsData.length !== flights.length) {
            console.log(chalk.red(`Flight not found`));
            return res.status(404).json({ message: "Flight not found" });
        }

        const validatedRoute = validateRoute(flightsData);

        if (!validatedRoute.valid) {
            console.log(chalk.red(`Invalid Route`));
            return res.status(400).json({ message: "Invalid route" });
        }

        const orderedFlights = validatedRoute.orderedFlights;

        const routeData = {
            flights: orderedFlights.map((flight) => flight.id),
            from: orderedFlights[0].originalAirportId,
            to: orderedFlights[orderedFlights.length - 1].destinationAirportId,
        };

        const result = await pool.query(
            `INSERT INTO "Bookings"(
                id,
                "contact",
                "passengers",
                "payment",
                "route",
                "timestamp",
                "userId"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                bookingId,
                encryptedContactData,
                encryptedPassengersData,
                encryptedPaymentData,
                routeData,
                new Date(),
                userId,
            ]
        );

        console.log(
            chalk.magenta(
                `Your booking has been store to table "Bookings" with id = "${bookingId}".`
            )
        );
        console.log(
            chalk.magenta(
                `The sensitive data are stored as encrypted data in database. To read data, please send request to the url below:`
            )
        );
        console.log(
            chalk.black.bgGreen("Method: GET") +
                " => " +
                chalk.white.bgBlue(`http://localhost:${PORT}/api/booking/read?id=${bookingId}`)
        );
        console.log(
            chalk.yellow(
                "Note: The url above should require token but it is made for auditing purpose only. So, no need to pass any token to it for now."
            )
        );
        res.status(201).json({ message: "Flight has been booked successfully" });
    } catch (err) {
        console.log(chalk.red(`Error booking flight: ${err.message}`));
        res.status(500).json({ message: "Internal Server error" });
    }
}
