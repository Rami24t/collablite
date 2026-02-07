import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: { 
    type: String,
    maxlength: 500
  },
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  members: [{ 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  }],
}, {
  timestamps: true
});

export const Project = mongoose.model<IProject>("Project", ProjectSchema);