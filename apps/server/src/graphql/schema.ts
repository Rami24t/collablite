import { gql } from "apollo-server-express";

// GraphQL type definitions for User, Project, and Task models and their queries and mutations
export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    owner: User!
    members: [User!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    project: Project!
    assignee: User
  }

  type Query {
    users: [User!]!
    projects: [Project!]!
    tasks: [Task!]!
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): User!
    createProject(name: String!, description: String, ownerId: ID!): Project!
    createTask(title: String!, projectId: ID!): Task!
    toggleTaskCompletion(taskId: ID!): Task!
  }
`;
