import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import mongoose from "mongoose";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import dotenv from "dotenv";
import { createDataLoaders } from "./dataloaders";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable trust proxy for Render
app.set('trust proxy', 1);

async function startServer() {
  console.log("🔗 Connecting to MongoDB Atlas...");
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    
    // Hide password in logs
    // const hiddenUri = MONGODB_URI.replace(/:([^:]+)@/, ':****@');
    // console.log(`Using MongoDB: ${hiddenUri}`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    
    console.log("✅ Connected to MongoDB Atlas!");
    
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB Atlas:", error.message);
    process.exit(1);
  }

  // Create Apollo Server instance
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // Keep introspection enabled for GraphQL playground
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  });
  
  // Start Apollo Server
  await server.start();
  
  // Configure CORS for production
  const corsOptions = {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    credentials: true,
  };
  
  // Apply Apollo middleware to Express
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    express.json({ limit: '10mb' }),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        req,
        dataloaders: createDataLoaders(),
      }),
    })
  );
  
  // Health check endpoint (important for Render)
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      service: 'collablite-backend',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Simple root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'CollabLite GraphQL API',
      graphql: '/graphql',
      health: '/health',
      docs: 'https://studio.apollographql.com/sandbox/explorer'
    });
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📚 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Error handlers
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received: closing HTTP server');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// Start the application
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});