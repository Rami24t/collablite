import DataLoader from "dataloader";
import { User } from "./models/User";
import { Project } from "./models/Project";
// import { Task } from "./models/Task";
// import { Types } from "mongoose";

// Create DataLoader for Users
const createUserLoader = () => {
  return new DataLoader(async (userIds: readonly string[]) => {
    const users = await User.find({
      _id: { $in: userIds as string[] }
    }).exec();
    
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });
    
    return userIds.map(id => userMap.get(id.toString()) || null);
  });
};

// Create DataLoader for Projects
const createProjectLoader = () => {
  return new DataLoader(async (projectIds: readonly string[]) => {
    const projects = await Project.find({
      _id: { $in: projectIds as string[] }
    }).exec();
    
    const projectMap = new Map();
    projects.forEach(project => {
      projectMap.set(project._id.toString(), project);
    });
    
    return projectIds.map(id => projectMap.get(id.toString()) || null);
  });
};

// Create DataLoader for batch fetching members
const createUsersByProjectLoader = () => {
  return new DataLoader(async (projectIds: readonly string[]) => {
    const projects = await Project.find({
      _id: { $in: projectIds as string[] }
    }).populate('members').exec();
    
    const projectMap = new Map();
    projects.forEach(project => {
      projectMap.set(project._id.toString(), project.members);
    });
    
    return projectIds.map(id => projectMap.get(id.toString()) || []);
  });
};

export const createDataLoaders = () => ({
  userLoader: createUserLoader(),
  projectLoader: createProjectLoader(),
  usersByProjectLoader: createUsersByProjectLoader(),
});