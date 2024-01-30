import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
// * routes
import authRoutes from "./routes/authRoutes";
import campaignRoutes from "./routes/campaignRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const mongo_uri = process.env.MONGO_URI as string;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/campaign", campaignRoutes);

mongoose
  .connect(mongo_uri)
  .then(() => console.log("Database active ✅"))
  .catch((error) => console.log(`An error occured: ${error}`));

app.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}/api`)
);
