import { User } from "../models/User";
import { Project } from "../models/Project";
import { Task } from "../models/Task";

export const resolvers = {
  Query: {
    users: () => User.find(),
    projects: () => Project.find(),
    tasks: () => Task.find(),
  },
  Mutation: {
    createUser: async (_: any, { username, email, password }: any) => {
      return User.create({ username, email, password });
    },
    createProject: async (_: any, { name, description, ownerId }: any) => {
      return Project.create({ name, description, owner: ownerId, members: [ownerId] });
    },
    createTask: async (_: any, { title, projectId }: any) => {
      return Task.create({ title, project: projectId });
    },
    toggleTaskCompletion: async (_: any, { taskId }: any) => {
      const task = await Task.findById(taskId);
      if (!task) throw new Error("Task not found");
      task.completed = !task.completed;
      return task.save();
    },
  },
  Project: {
    owner: (project: any) => User.findById(project.owner),
    members: (project: any) => User.find({ _id: { $in: project.members } }),
  },
  Task: {
    project: (task: any) => Project.findById(task.project),
    assignee: (task: any) => task.assignee && User.findById(task.assignee),
  },
};
