import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import mongoose from "mongoose";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import dotenv from "dotenv";
import { createDataLoaders } from "./dataloaders";
import cors from "cors";

dotenv.config();

async function start() {
  console.log("🔗 Connecting to MongoDB Atlas...");
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI is not defined in .env file");
      console.log("💡 Create a .env file in apps/server/ with your MongoDB Atlas connection string");
      process.exit(1);
    }
    
    // Hide password in logs
    const hiddenUri = MONGODB_URI.replace(/:([^:]+)@/, ':****@');
    console.log(`Using connection: ${hiddenUri}`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log("✅ Connected to MongoDB Atlas!");
    
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB Atlas:", error.message);
    process.exit(1);
  }

  // Initialize Express app
  const app = express();
  const PORT = process.env.PORT || 4000;
  
  // Create Apollo Server instance
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  });
  
  // Start Apollo Server
  await server.start();
  
  // Apply Apollo middleware to Express
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        req,
        dataloaders: createDataLoaders(),
      }),
    })
  );
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`\n🚀 Server ready at http://localhost:${PORT}`);
    console.log(`📚 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

// Error handlers
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

// Start the application
start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});