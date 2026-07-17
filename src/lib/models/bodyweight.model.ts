import mongoose, { Schema } from "mongoose";

const BodyweightSchema = new Schema({
  id: { type: String, unique: true, required: true },
  date: String,
  weightKg: Number,
  updatedAt: Number,
});

export const BodyweightModel =
  mongoose.models.Bodyweight ?? mongoose.model("Bodyweight", BodyweightSchema);
