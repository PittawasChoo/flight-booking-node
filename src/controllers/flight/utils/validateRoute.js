import lodash from "lodash";
import moment from "moment";
import { getTimeDiff, combineDateTime } from "#modules/date";

const { orderBy } = lodash;

// API can find connecting flight up to 2 stops (3 flight) per route
const STOPS_LIMIT_PER_ROUTES = 2;

// API can find connecting flight within 1 day after departure date
const EXTRA_DAYS_UNTIL_ARRIVE = 1;

export const validateRoute = (flights) => {
    if (flights.length > STOPS_LIMIT_PER_ROUTES + 1) {
        return { valid: false };
    }

    const orderedFlights = orderBy(flights, ["departureDate", "departureTime"]);

    const isConnectedCorrectly = orderedFlights.reduce(
        (previousConnection, currentFlight, index) => {
            if (index > 0) {
                const previousFlight = orderedFlights[index - 1];

                const previousFlightArrivalDateTime = combineDateTime(
                    previousFlight.arrivalDate,
                    previousFlight.arrivalTime
                );
                const currentFlightDepartureDateTime = combineDateTime(
                    currentFlight.departureDate,
                    currentFlight.departureTime
                );
                const connectingTime = getTimeDiff(
                    previousFlightArrivalDateTime,
                    currentFlightDepartureDateTime
                );

                const isDepartFromArrivalAirport =
                    currentFlight.originalAirportId === previousFlight.destinationAirportId;
                const connectingTimeIsCorrect = connectingTime >= 60 && connectingTime <= 600;

                return previousConnection && isDepartFromArrivalAirport && connectingTimeIsCorrect;
            } else return true;
        }
    );

    const departuteDate = moment(orderedFlights[0].departureDate);
    const arrivalDate = moment(orderedFlights[orderedFlights.length - 1].arrivalDate);
    const isTravelInCorrectPeriod =
        departuteDate.diff(arrivalDate, "day") <= EXTRA_DAYS_UNTIL_ARRIVE;

    return {
        valid: isConnectedCorrectly && isTravelInCorrectPeriod,
        orderedFlights: orderedFlights,
    };
};
