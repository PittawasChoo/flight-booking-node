import express from "express";
import cors from "cors";
import morgan from "morgan";
import airportRoutes from "./routes/airportRoutes.js";
import flightRoutes from "./routes/flightRoutes.js";
// import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use(morgan("dev")); // use morgan("dev") to color the status console.
// morgan("dev") will show this output format => :method :url :status :response-time ms - :res[content-length]
// We can switch to code next line instead to customize the output format
// app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));

// Routes
// app.use("/api/user", userRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/flights", flightRoutes);

// Error handling middleware
// app.use(errorMiddleware);

export default app;
