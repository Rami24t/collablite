import { Schema, Document, model, Types } from "mongoose";
import { IUser } from "./User";
import { IProject } from "./Project";

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  project: Types.ObjectId | IProject;
  assignee?: Types.ObjectId | IUser;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  description: { 
    type: String,
    maxlength: 1000
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  project: { 
    type: Schema.Types.ObjectId, 
    ref: "Project", 
    required: true 
  },
  assignee: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  dueDate: { 
    type: Date 
  },
}, {
  timestamps: true
});

// Index for faster queries
TaskSchema.index({ project: 1, completed: 1 });
TaskSchema.index({ assignee: 1 });

export const Task = model<ITask>("Task", TaskSchema);