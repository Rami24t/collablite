import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: String,
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
