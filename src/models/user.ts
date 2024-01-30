import mongoose, { Document, Schema } from "mongoose";

export type TUser = Document & {
  fullName: string;
  password: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  otp: string | null;
  // campaigns: TCampaign[];
};

const userSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  // campaigns: {type: TCamap}
});

export default mongoose.model<TUser>("User", userSchema);
