import { User } from "../models/User";
import { Project } from "../models/Project";
import { Task } from "../models/Task";

export const resolvers = {
  Query: {
    // User queries
    users: () => User.find().sort({ createdAt: -1 }).exec(),
    user: (_: any, { id }: any, context: any) => 
      context.dataloaders.userLoader.load(id),
    
    // Project queries
    projects: () => Project.find().sort({ createdAt: -1 }).exec(),
    project: (_: any, { id }: any, context: any) => 
      context.dataloaders.projectLoader.load(id),
    
    userProjects: async (_: any, { userId }: any) => {
      return Project.find({
        $or: [
          { owner: userId },
          { members: userId }
        ]
      }).sort({ createdAt: -1 }).exec();
    },
    
    // Task queries
    tasks: () => Task.find().sort({ createdAt: -1 }).exec(),
    task: (_: any, { id }: any) => Task.findById(id).exec(),
    projectTasks: (_: any, { projectId }: any) => 
      Task.find({ project: projectId }).sort({ createdAt: -1 }).exec(),
    userTasks: async (_: any, { userId }: any) => {
      return Task.find({ assignee: userId }).sort({ createdAt: -1 }).exec();
    },
  },
  
  Mutation: {
    // User mutations
    createUser: async (_: any, { username, email, password }: any) => {
      const user = new User({ username, email, password });
      return user.save();
    },
    
    updateUser: async (_: any, { id, username, email }: any) => {
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      
      return User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).exec();
    },
    
    deleteUser: async (_: any, { id }: any) => {
      await User.findByIdAndDelete(id).exec();
      return true;
    },
    
    // Project mutations
    createProject: async (_: any, { name, description, ownerId }: any, context: any) => {
      const owner = await context.dataloaders.userLoader.load(ownerId);
      if (!owner) throw new Error("Owner not found");
      
      const project = new Project({ 
        name, 
        description, 
        owner: ownerId,
        members: [ownerId]
      });
      return project.save();
    },
    
    updateProject: async (_: any, { id, name, description }: any) => {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      
      return Project.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).exec();
    },
    
    deleteProject: async (_: any, { id }: any) => {
      await Task.deleteMany({ project: id }).exec();
      await Project.findByIdAndDelete(id).exec();
      return true;
    },
    
    addProjectMember: async (_: any, { projectId, userId }: any) => {
      return Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { members: userId } },
        { new: true }
      ).exec();
    },
    
    removeProjectMember: async (_: any, { projectId, userId }: any) => {
      return Project.findByIdAndUpdate(
        projectId,
        { $pull: { members: userId } },
        { new: true }
      ).exec();
    },
    
    // Task mutations
    createTask: async (_: any, { title, projectId, description, assigneeId }: any, context: any) => {
      const project = await context.dataloaders.projectLoader.load(projectId);
      if (!project) throw new Error("Project not found");
      
      if (assigneeId) {
        const assignee = await context.dataloaders.userLoader.load(assigneeId);
        if (!assignee) throw new Error("Assignee not found");
      }
      
      const task = new Task({ 
        title, 
        project: projectId, 
        description,
        assignee: assigneeId
      });
      return task.save();
    },
    
    updateTask: async (_: any, { id, title, description, completed }: any) => {
      const updateData: any = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (completed !== undefined) updateData.completed = completed;
      
      return Task.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).exec();
    },
    
    deleteTask: async (_: any, { id }: any) => {
      await Task.findByIdAndDelete(id).exec();
      return true;
    },
    
    toggleTaskCompletion: async (_: any, { id }: any) => {
      const task = await Task.findById(id).exec();
      if (!task) throw new Error("Task not found");
      task.completed = !task.completed;
      return task.save();
    },
    
    assignTask: async (_: any, { taskId, userId }: any) => {
      return Task.findByIdAndUpdate(
        taskId,
        { assignee: userId },
        { new: true }
      ).exec();
    },
    
    unassignTask: async (_: any, { taskId }: any) => {
      return Task.findByIdAndUpdate(
        taskId,
        { $unset: { assignee: 1 } },
        { new: true }
      ).exec();
    },
  },
  
  // Field resolvers using DataLoader
  Project: {
    owner: (project: any, _: any, context: any) => {
      if (project.owner && typeof project.owner === 'object' && project.owner._id) {
        return project.owner;
      }
      return context.dataloaders.userLoader.load(project.owner.toString());
    },
    
    members: (project: any, _: any, context: any) => {
      if (project.members && project.members.length > 0 && 
          typeof project.members[0] === 'object' && project.members[0]._id) {
        return project.members;
      }
      return context.dataloaders.usersByProjectLoader.load(project._id.toString());
    },
  },
  
  Task: {
    project: (task: any, _: any, context: any) => {
      if (task.project && typeof task.project === 'object' && task.project._id) {
        return task.project;
      }
      return context.dataloaders.projectLoader.load(task.project.toString());
    },
    
    assignee: (task: any, _: any, context: any) => {
      if (!task.assignee) return null;
      if (task.assignee && typeof task.assignee === 'object' && task.assignee._id) {
        return task.assignee;
      }
      return context.dataloaders.userLoader.load(task.assignee.toString());
    },
  },
};