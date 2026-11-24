import dotenv from "dotenv/config";
import connectDB from "./db/mongoDB.js";
import { app } from "./app.js";
import * as config from "./config/config.js";
import { connectRedis } from "./db/redis.js";

connectDB()
.then(async()=>{
    await connectRedis();
    const port = config.PORT;
    app.listen(port, ()=>{
        console.log(`server running at port: ${port}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed ", err);
});