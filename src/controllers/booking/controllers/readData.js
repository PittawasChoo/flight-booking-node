import chalk from "chalk";

import { decryptContact } from "#utils/encryptions/contactEncryptions";
import { decryptPassenger } from "#utils/encryptions/passengerEncryptions";
import { decryptPayment } from "#utils/encryptions/paymentEncryptions";
import { getRouteData } from "#controllers/flight/utils/getRouteData";
import { pool } from "#config/dbConfig";

// Get booking detail
export async function readData(req, res) {
    const { id: bookingId } = req.query;

    try {
        // get related flights
        const bookingQuery = `
            SELECT * FROM public."Bookings"
            WHERE id = $1;
        `;
        const bookingQueryResult = await pool.query(bookingQuery, [bookingId]);
        if (!bookingQueryResult) {
            console.log(chalk.red(`Booking not found`));
            return res.status(404).json({ message: "Booking not found" });
        }
        const bookingData = bookingQueryResult.rows[0];

        const { id, route, timestamp, contact, passengers, payment, userId } = bookingData;
        const decryptedContact = decryptContact(contact);
        const decryptedPassengers = decryptPassenger(passengers);
        const decryptedPayment = decryptPayment(payment);

        const routeData = await getRouteData(route.flights);

        if (!routeData.success) {
            console.log(chalk.red(routeData.errorMessage));
            return res.status(routeData.status).json({ message: routeData.errorMessage });
        }

        console.log(
            chalk.magenta(`Your booking detail is now sent back. Please check the response data`)
        );
        res.status(200).json({
            data: {
                id,
                contact: decryptedContact,
                passengers: decryptedPassengers,
                payment: decryptedPayment,
                routeData: routeData.data,
                timestamp,
                userId,
            },
        });
    } catch (err) {
        console.log(chalk.red(`Error reading booking data: ${err.message}`));
        res.status(500).json({ message: "Internal Server error" });
    }
}
