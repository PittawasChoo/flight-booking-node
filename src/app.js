import express from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import xss from "xss-clean";

import airportRoutes from "#routes/airportRoutes";
import bookingRoutes from "#routes/bookingRoutes";
import flightRoutes from "#routes/flightRoutes";
import userRoutes from "#routes/userRoutes";

const app = express();

// Middleware
app.use(express.json());

// Security
// Secure HTTP Header
app.use(helmet());

// Data sanitization against site script xss
app.use(xss());

// For database query, Postgresql has already provided the secure funtion to prevent injection
// read more: https://github.com/brianc/node-postgres/wiki/FAQ#8-does-node-postgres-handle-sql-injection

app.use(cors());

// Error handler
app.use(morgan("dev"));
// use morgan("dev") to color the status console.
// morgan("dev") will show this output format => :method :url :status :response-time ms - :res[content-length]
// We can switch to the code next line instead to customize the output format
// app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));

// Routes
app.use("/api/airports", airportRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/user", userRoutes);

// Error handling middleware
// app.use(errorMiddleware);

export default app;
