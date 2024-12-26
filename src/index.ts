import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/routes";
import postRoute from "./routes/postRoute";
import cors from "cors";

dotenv.config();

const app = express();

const Port = process.env.PORT;
console.log(Port);

const DB_URL = process.env.DBURL as string;
console.log(DB_URL);
app.use(cors({ origin: process.env.FRONTENDURL }));
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/auth",postRoute)

mongoose
  .connect(DB_URL)
  .then(() => console.log("connected to mongoDB"))
  .catch((error) => console.error("failed to connect to mongoDb", error));
app.listen(Port, () => {
  console.log(`server is running in ${Port}`);
});

export default app;
