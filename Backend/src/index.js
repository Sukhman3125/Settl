import dotenv from "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import * as config from "./config/config.js";

connectDB()
.then(async()=>{
    const port = config.PORT;
    app.listen(port, ()=>{
        console.log(`server running at port: ${port}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed ", err);
});