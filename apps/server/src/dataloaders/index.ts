import DataLoader from "dataloader";
import { User } from "../models/User";
import { Project } from "../models/Project";

// Create DataLoader for Users
const createUserLoader = (): DataLoader<string, any> => {
  return new DataLoader(async (userIds: readonly string[]) => {
    const users = await User.find({
      _id: { $in: userIds as string[] }
    }).exec();
    
    const userMap = new Map();
    users.forEach((user: any) => {
      userMap.set(user._id.toString(), user);
    });
    
    return userIds.map(id => userMap.get(id.toString()) || null);
  });
};

// Create DataLoader for Projects
const createProjectLoader = (): DataLoader<string, any> => {
  return new DataLoader(async (projectIds: readonly string[]) => {
    const projects = await Project.find({
      _id: { $in: projectIds as string[] }
    }).exec();
    
    const projectMap = new Map();
    projects.forEach((project: any) => {
      projectMap.set(project._id.toString(), project);
    });
    
    return projectIds.map(id => projectMap.get(id.toString()) || null);
  });
};

// Create DataLoader for batch fetching members
const createUsersByProjectLoader = (): DataLoader<string, any> => {
  return new DataLoader(async (projectIds: readonly string[]) => {
    const projects = await Project.find({
      _id: { $in: projectIds as string[] }
    }).populate('members').exec();
    
    const projectMap = new Map();
    projects.forEach((project: any) => {
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