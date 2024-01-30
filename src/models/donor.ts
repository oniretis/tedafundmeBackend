import mongoose, { Document, Schema } from "mongoose";

export type TDonor = Document & {
  name: string;
  email: string;
  amount: number;
  campaignId: mongoose.Types.ObjectId;
};

const donorSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
});

export default mongoose.model<TDonor>("Donor", donorSchema); // Use "Donor" as the model name
