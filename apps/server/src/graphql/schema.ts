// import { gql } from "apollo-server-express";
import gql from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    owner: User!
    members: [User!]!
    createdAt: String!
    updatedAt: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    project: Project!
    assignee: User
    dueDate: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    # User queries
    users: [User!]!
    user(id: ID!): User
    
    # Project queries
    projects: [Project!]!
    project(id: ID!): Project
    userProjects(userId: ID!): [Project!]!
    
    # Task queries
    tasks: [Task!]!
    task(id: ID!): Task
    projectTasks(projectId: ID!): [Task!]!
    userTasks(userId: ID!): [Task!]!
  }

  type Mutation {
    # User mutations
    createUser(username: String!, email: String!, password: String!): User!
    updateUser(id: ID!, username: String, email: String): User!
    deleteUser(id: ID!): Boolean!
    
    # Project mutations
    createProject(name: String!, description: String, ownerId: ID!): Project!
    updateProject(id: ID!, name: String, description: String): Project!
    deleteProject(id: ID!): Boolean!
    addProjectMember(projectId: ID!, userId: ID!): Project!
    removeProjectMember(projectId: ID!, userId: ID!): Project!
    
    # Task mutations
    createTask(title: String!, projectId: ID!, description: String, assigneeId: ID): Task!
    updateTask(id: ID!, title: String, description: String, completed: Boolean): Task!
    deleteTask(id: ID!): Boolean!
    toggleTaskCompletion(id: ID!): Task!
    assignTask(taskId: ID!, userId: ID!): Task!
    unassignTask(taskId: ID!): Task!
  }
`;