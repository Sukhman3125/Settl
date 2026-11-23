import dotenv from "dotenv/config";
import { app } from "./app.js";
import * as config from "./config/config.js";

console.log(config.PORT);

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
