import mongoose from "mongoose";
import { DB_NAME } from "../config/constants.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("connection successful MongoDB", connectionInstance.connection.host);
    }catch(error){
        console.log("Mongo connection Error: ", error);
        process.exit(1);
    }
}

export default connectDB;