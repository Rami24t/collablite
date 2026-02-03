import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function start() {
  // MongoDB Connection
  try {
    console.log("🔗 Connecting to MongoDB...");
    // Local: await mongoose.connect("mongodb://127.0.0.1:27017/collablite", {serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, family: 4, });
    // Cloud - Atlas
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://USER:PWD@CLSTR.XXX.mongodb.net/DB?retryWrites=true&w=majority";
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB Atlas!");
    // Connection event listeners
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    console.log("\n💡 Make sure:");
    console.log("1. Your MongoDB Atlas cluster is running");
    console.log("2. IP address is whitelisted (0.0.0.0/0 for all IPs)");
    console.log("3. Database user credentials are correct");
    process.exit(1);
  }

  // Express + Apollo Server setup
  const app = express();
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📚 GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

// Error handling
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

start();