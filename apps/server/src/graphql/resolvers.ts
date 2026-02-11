import { User } from "../models/User";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import { Types } from "mongoose";

// Type definitions for better type safety
interface Context {
  dataloaders: {
    userLoader: any;
    projectLoader: any;
    usersByProjectLoader: any;
  };
  req?: any;
}

interface UserInput {
  username: string;
  email: string;
  password: string;
}

interface UpdateUserInput {
  id: string;
  username?: string;
  email?: string;
}

// Helper function to convert dates to ISO strings
const toISOString = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return new Date(date).toISOString();
  if (typeof date === 'number') return new Date(date).toISOString();
  return new Date().toISOString();
};

export const resolvers = {
  Query: {
    // User queries
    users: async (): Promise<any[]> => {
      try {
        return await User.find().sort({ createdAt: -1 }).exec();
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
      }
    },
    
    user: async (_: any, { id }: { id: string }, context: Context): Promise<any> => {
      try {
        return await context.dataloaders.userLoader.load(id);
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        throw new Error(`User with id ${id} not found`);
      }
    },
    
    // Project queries
    projects: async (): Promise<any[]> => {
      try {
        return await Project.find().sort({ createdAt: -1 }).exec();
      } catch (error) {
        console.error("Error fetching projects:", error);
        throw new Error("Failed to fetch projects");
      }
    },
    
    project: async (_: any, { id }: { id: string }, context: Context): Promise<any> => {
      try {
        return await context.dataloaders.projectLoader.load(id);
      } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        throw new Error(`Project with id ${id} not found`);
      }
    },
    
    userProjects: async (_: any, { userId }: { userId: string }): Promise<any[]> => {
      try {
        return await Project.find({
          $or: [
            { owner: userId },
            { members: userId }
          ]
        }).sort({ createdAt: -1 }).exec();
      } catch (error) {
        console.error(`Error fetching projects for user ${userId}:`, error);
        throw new Error("Failed to fetch user projects");
      }
    },
    
    // Task queries
    tasks: async (): Promise<any[]> => {
      try {
        return await Task.find().sort({ createdAt: -1 }).exec();
      } catch (error) {
        console.error("Error fetching tasks:", error);
        throw new Error("Failed to fetch tasks");
      }
    },
    
    task: async (_: any, { id }: { id: string }): Promise<any> => {
      try {
        const task = await Task.findById(id).exec();
        if (!task) throw new Error("Task not found");
        return task;
      } catch (error) {
        console.error(`Error fetching task ${id}:`, error);
        throw new Error(`Task with id ${id} not found`);
      }
    },
    
    projectTasks: async (_: any, { projectId }: { projectId: string }): Promise<any[]> => {
      try {
        return await Task.find({ project: projectId }).sort({ createdAt: -1 }).exec();
      } catch (error) {
        console.error(`Error fetching tasks for project ${projectId}:`, error);
        throw new Error("Failed to fetch project tasks");
      }
    },
    
    userTasks: async (_: any, { userId }: { userId: string }): Promise<any[]> => {
      try {
        return await Task.find({ assignee: userId }).sort({ createdAt: -1 }).exec();
      } catch (error) {
        console.error(`Error fetching tasks for user ${userId}:`, error);
        throw new Error("Failed to fetch user tasks");
      }
    },
  },
  
  Mutation: {
    // User mutations
    createUser: async (_: any, { username, email, password }: UserInput): Promise<any> => {
      try {
        // Validate input
        if (!username || username.length < 3) {
          throw new Error("Username must be at least 3 characters");
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
          throw new Error("Please enter a valid email");
        }
        if (!password || password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email }).exec();
        if (existingUser) {
          throw new Error("User with this email already exists");
        }
        
        const user = new User({ username, email, password });
        return await user.save();
      } catch (error: any) {
        console.error("Error creating user:", error);
        throw new Error(error.message || "Failed to create user");
      }
    },
    
    updateUser: async (_: any, { id, username, email }: UpdateUserInput): Promise<any> => {
      try {
        const updateData: any = {};
        if (username) {
          if (username.length < 3) throw new Error("Username must be at least 3 characters");
          updateData.username = username;
        }
        if (email) {
          if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email");
          updateData.email = email;
        }
        
        if (Object.keys(updateData).length === 0) {
          throw new Error("No update data provided");
        }
        
        const updatedUser = await User.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true, runValidators: true }
        ).exec();
        
        if (!updatedUser) {
          throw new Error("User not found");
        }
        
        return updatedUser;
      } catch (error: any) {
        console.error(`Error updating user ${id}:`, error);
        throw new Error(error.message || "Failed to update user");
      }
    },
    
    deleteUser: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const user = await User.findById(id).exec();
        if (!user) {
          throw new Error("User not found");
        }
        
        // Delete user's projects and tasks
        await Project.deleteMany({ owner: id }).exec();
        await Task.deleteMany({ assignee: id }).exec();
        
        // Remove user from project memberships
        await Project.updateMany(
          { members: id },
          { $pull: { members: id } }
        ).exec();
        
        await User.findByIdAndDelete(id).exec();
        return true;
      } catch (error: any) {
        console.error(`Error deleting user ${id}:`, error);
        throw new Error(error.message || "Failed to delete user");
      }
    },
    
    // Project mutations
    createProject: async (_: any, { name, description, ownerId }: any, context: Context): Promise<any> => {
      try {
        // Validate input
        if (!name || name.length < 3) {
          throw new Error("Project name must be at least 3 characters");
        }
        
        const owner = await context.dataloaders.userLoader.load(ownerId);
        if (!owner) throw new Error("Owner not found");
        
        const project = new Project({ 
          name, 
          description, 
          owner: ownerId,
          members: [ownerId]
        });
        
        return await project.save();
      } catch (error: any) {
        console.error("Error creating project:", error);
        throw new Error(error.message || "Failed to create project");
      }
    },
    
    updateProject: async (_: any, { id, name, description }: any): Promise<any> => {
      try {
        const updateData: any = {};
        if (name) {
          if (name.length < 3) throw new Error("Project name must be at least 3 characters");
          updateData.name = name;
        }
        if (description !== undefined) updateData.description = description;
        
        if (Object.keys(updateData).length === 0) {
          throw new Error("No update data provided");
        }
        
        const updatedProject = await Project.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true, runValidators: true }
        ).exec();
        
        if (!updatedProject) {
          throw new Error("Project not found");
        }
        
        return updatedProject;
      } catch (error: any) {
        console.error(`Error updating project ${id}:`, error);
        throw new Error(error.message || "Failed to update project");
      }
    },
    
    deleteProject: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const project = await Project.findById(id).exec();
        if (!project) {
          throw new Error("Project not found");
        }
        
        await Task.deleteMany({ project: id }).exec();
        await Project.findByIdAndDelete(id).exec();
        return true;
      } catch (error: any) {
        console.error(`Error deleting project ${id}:`, error);
        throw new Error(error.message || "Failed to delete project");
      }
    },
    
    addProjectMember: async (_: any, { projectId, userId }: any): Promise<any> => {
      try {
        // Check if project exists
        const project = await Project.findById(projectId).exec();
        if (!project) throw new Error("Project not found");
        
        // Check if user exists
        const user = await User.findById(userId).exec();
        if (!user) throw new Error("User not found");
        
        // Check if user is already a member
        if (project.members.includes(userId)) {
          throw new Error("User is already a member of this project");
        }
        
        return await Project.findByIdAndUpdate(
          projectId,
          { $addToSet: { members: userId } },
          { new: true }
        ).exec();
      } catch (error: any) {
        console.error(`Error adding member to project ${projectId}:`, error);
        throw new Error(error.message || "Failed to add project member");
      }
    },
    
    removeProjectMember: async (_: any, { projectId, userId }: any): Promise<any> => {
      try {
        const project = await Project.findById(projectId).exec();
        if (!project) throw new Error("Project not found");
        
        // Check if user is the owner
        if (project.owner.toString() === userId) {
          throw new Error("Cannot remove the project owner");
        }
        
        // Check if user is actually a member
        if (!project.members.includes(userId)) {
          throw new Error("User is not a member of this project");
        }
        
        return await Project.findByIdAndUpdate(
          projectId,
          { $pull: { members: userId } },
          { new: true }
        ).exec();
      } catch (error: any) {
        console.error(`Error removing member from project ${projectId}:`, error);
        throw new Error(error.message || "Failed to remove project member");
      }
    },
    
    // Task mutations
    createTask: async (_: any, { title, projectId, description, assigneeId }: any, context: Context): Promise<any> => {
      try {
        // Validate input
        if (!title || title.length < 3) {
          throw new Error("Task title must be at least 3 characters");
        }
        
        const project = await context.dataloaders.projectLoader.load(projectId);
        if (!project) throw new Error("Project not found");
        
        if (assigneeId) {
          const assignee = await context.dataloaders.userLoader.load(assigneeId);
          if (!assignee) throw new Error("Assignee not found");
          
          // Check if assignee is a project member
          if (!project.members.includes(assigneeId)) {
            throw new Error("Assignee must be a project member");
          }
        }
        
        const task = new Task({ 
          title, 
          project: projectId, 
          description,
          assignee: assigneeId
        });
        
        return await task.save();
      } catch (error: any) {
        console.error("Error creating task:", error);
        throw new Error(error.message || "Failed to create task");
      }
    },
    
    updateTask: async (_: any, { id, title, description, completed }: any): Promise<any> => {
      try {
        const updateData: any = {};
        if (title) {
          if (title.length < 3) throw new Error("Task title must be at least 3 characters");
          updateData.title = title;
        }
        if (description !== undefined) updateData.description = description;
        if (completed !== undefined) updateData.completed = completed;
        
        if (Object.keys(updateData).length === 0) {
          throw new Error("No update data provided");
        }
        
        const updatedTask = await Task.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true, runValidators: true }
        ).exec();
        
        if (!updatedTask) {
          throw new Error("Task not found");
        }
        
        return updatedTask;
      } catch (error: any) {
        console.error(`Error updating task ${id}:`, error);
        throw new Error(error.message || "Failed to update task");
      }
    },
    
    deleteTask: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const task = await Task.findById(id).exec();
        if (!task) {
          throw new Error("Task not found");
        }
        
        await Task.findByIdAndDelete(id).exec();
        return true;
      } catch (error: any) {
        console.error(`Error deleting task ${id}:`, error);
        throw new Error(error.message || "Failed to delete task");
      }
    },
    
    toggleTaskCompletion: async (_: any, { id }: { id: string }): Promise<any> => {
      try {
        const task = await Task.findById(id).exec();
        if (!task) throw new Error("Task not found");
        
        task.completed = !task.completed;
        return await task.save();
      } catch (error: any) {
        console.error(`Error toggling task completion ${id}:`, error);
        throw new Error(error.message || "Failed to toggle task completion");
      }
    },
    
    assignTask: async (_: any, { taskId, userId }: any): Promise<any> => {
      try {
        const task = await Task.findById(taskId).exec();
        if (!task) throw new Error("Task not found");
        
        const project = await Project.findById(task.project).exec();
        if (!project) throw new Error("Project not found");
        
        if (userId) {
          const user = await User.findById(userId).exec();
          if (!user) throw new Error("User not found");
          
          // Check if user is a project member
          if (!project.members.includes(userId)) {
            throw new Error("User must be a project member to be assigned tasks");
          }
        }
        
        return await Task.findByIdAndUpdate(
          taskId,
          { assignee: userId },
          { new: true }
        ).exec();
      } catch (error: any) {
        console.error(`Error assigning task ${taskId}:`, error);
        throw new Error(error.message || "Failed to assign task");
      }
    },
    
    unassignTask: async (_: any, { taskId }: { taskId: string }): Promise<any> => {
      try {
        const task = await Task.findById(taskId).exec();
        if (!task) throw new Error("Task not found");
        
        return await Task.findByIdAndUpdate(
          taskId,
          { $unset: { assignee: 1 } },
          { new: true }
        ).exec();
      } catch (error: any) {
        console.error(`Error unassigning task ${taskId}:`, error);
        throw new Error(error.message || "Failed to unassign task");
      }
    },
  },
  
  // Field resolvers using DataLoader
  Project: {
    owner: (project: any, _: any, context: Context) => {
      if (project.owner && typeof project.owner === 'object' && project.owner._id) {
        return project.owner;
      }
      return context.dataloaders.userLoader.load(project.owner.toString());
    },
    
    members: (project: any, _: any, context: Context) => {
      if (project.members && project.members.length > 0 && 
          typeof project.members[0] === 'object' && project.members[0]._id) {
        return project.members;
      }
      return context.dataloaders.usersByProjectLoader.load(project._id.toString());
    },
    
    // Add timestamp resolvers
    createdAt: (project: any) => toISOString(project.createdAt),
    updatedAt: (project: any) => toISOString(project.updatedAt),
  },
  
  Task: {
    project: (task: any, _: any, context: Context) => {
      if (task.project && typeof task.project === 'object' && task.project._id) {
        return task.project;
      }
      return context.dataloaders.projectLoader.load(task.project.toString());
    },
    
    assignee: (task: any, _: any, context: Context) => {
      if (!task.assignee) return null;
      if (task.assignee && typeof task.assignee === 'object' && task.assignee._id) {
        return task.assignee;
      }
      return context.dataloaders.userLoader.load(task.assignee.toString());
    },
    
    // Add timestamp resolvers
    createdAt: (task: any) => toISOString(task.createdAt),
    updatedAt: (task: any) => toISOString(task.updatedAt),
    
    // Add dueDate resolver if it exists
    dueDate: (task: any) => task.dueDate ? toISOString(task.dueDate) : null,
  },
  
  // ADD THIS: User type resolvers (CRITICAL for fixing your frontend issue)
  User: {
    createdAt: (user: any) => toISOString(user.createdAt),
    updatedAt: (user: any) => toISOString(user.updatedAt),
  },
};