import mongoose, { Schema } from "mongoose";

const SetSchema = new Schema(
  { weight: Number, reps: Number, done: Boolean },
  { _id: false }
);
const ExerciseSchema = new Schema(
  {
    name: String,
    targetSets: Number,
    repRange: String,
    skipped: Boolean,
    note: String,
    sets: [SetSchema],
  },
  { _id: false }
);
const SessionSchema = new Schema({
  id: { type: String, unique: true, required: true },
  date: String,
  dayKey: String,
  title: String,
  exercises: [ExerciseSchema],
  cardioDone: Boolean,
  updatedAt: Number,
});

export const SessionModel =
  mongoose.models.Session ?? mongoose.model("Session", SessionSchema);
