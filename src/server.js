import app from "./app.js";
import { PORT } from "./config/config.js";
import connectDB from "./config/dbConfig.js";

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is now running on port ${PORT}`);
    });
});
