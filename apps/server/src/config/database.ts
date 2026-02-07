import mongoose from 'mongoose';

// Prevent multiple connections in development
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collablite', {
    serverSelectionTimeoutMS: 5000,
  });
}

export default mongoose;