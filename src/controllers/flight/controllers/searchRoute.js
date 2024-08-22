import chalk from "chalk";

import { getRouteData } from "../utils/getRouteData.js";

// Search route data from flights in route
export async function searchRoute(req, res) {
    const { flights } = req.query;

    try {
        const routeData = await getRouteData(flights);

        if (!routeData.success) {
            console.log(chalk.red(routeData.errorMessage));
            return res.status(routeData.status).json({ message: routeData.message });
        }

        console.log(chalk.magenta(`Route data is now sent. Please check the response data`));
        res.status(200).json({ routeData: routeData.data });
    } catch (err) {
        console.log(chalk.red(`Error getting route data: ${err.message}`));
        res.status(500).json({ message: "Internal Server error" });
    }
}
