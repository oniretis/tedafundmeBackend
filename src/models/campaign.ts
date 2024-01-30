import mongoose, { Document, Schema } from "mongoose";
import Donor, { TDonor } from "./donor";

export type TCatgory = "HEALTH" | "EDUCATION";
export type TCampaign = Document & {
  userId: mongoose.Types.ObjectId;
  name: string;
  story: string;
  goal: number;
  category: TCatgory;
  location: string;
  currentGoal: number;
  coverMedia: string;
  donors: mongoose.Types.ObjectId[];
};

const campaignSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  story: { type: String, required: true },
  goal: { type: Number, required: true },
  category: { type: String, enum: ['HEALTH, "EDUCATION'], required: true },
  location: { type: String, required: true },
  currenGoal: { type: Number, default: 0 },
  coverMedia: { type: String, required: true },
  donors: [{ type: Schema.Types.ObjectId, ref: "Donor" }],
});

export default mongoose.model<TCampaign>("Campaign", campaignSchema);
