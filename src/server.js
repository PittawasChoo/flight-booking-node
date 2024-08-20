import { PORT } from "#config/config";
import connectDB from "#config/dbConfig";

import app from "./app.js";

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is now running on port ${PORT}`);
    });
});
