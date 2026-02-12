# CollabLite

[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Apollo GraphQL](https://img.shields.io/badge/Apollo%20GraphQL-4.x-purple)](https://www.apollographql.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![PNPM](https://img.shields.io/badge/PNPM-workspaces-yellow)](https://pnpm.io/)


### My main purpose of this showcase project

- ✅ to create, consume, and deploy a fully funcitonal fullstack apollo GraphQL project
- ✅ To practice my TypeScript knowledge
- ✅ To get to know and practice GraphQL, Apollo, Apollo server, Mutations, Queries, gql schemas (in this Fullstack MERN stack project)
#### Overview
- ✅ Fully Functional React Vite (TypeScript) Frontend
- ✅ Fully Functional Node Express Apollo JS server (TypeScript) Backend
- ✅ MongoDB (Atlas) integration
- ✅ Basic project/task management (✅ Backend)
- ✅ Read, Create and Delete Users using Apollo and GraphQL (queries and mutations) (✅ Frontend ; ✅ Backend)
- ✅ Deployment: live-demo: https://collablite.onrender.com/


## 🏗️ Architecture

### Frontend
- **React** - Modern React with hooks and concurrent features
- **Apollo Client** - GraphQL client with real-time subscriptions
- **Vite** - Lightning fast build tool and dev server
- **TypeScript** - Full type safety across the application

### Backend
- **Apollo Server** - Production-ready GraphQL server
- **Node.js 20+** - Latest LTS version with modern features
- **MongoDB Atlas** - Fully-managed cloud database
- **Mongoose ODM** - Elegant MongoDB object modeling

### Real-Time Infrastructure
- **GraphQL Subscriptions** - WebSocket-based real-time updates
- **Optimistic UI** - Instant feedback while waiting for server response
- **DataLoader** - Efficient batching and caching to prevent N+1 problems


2026 Rami Al-Saadi


# CollabLite: Real-Time Collaboration Platform


A modern, real-time collaboration platform built with a cutting-edge tech stack and production-ready architecture. CollabLite enables teams to collaborate seamlessly with live document updates, task management, and presence indicators.

## ✨ Features

### 🎯 Core Features
- **Real-Time Collaboration** - Live document updates with WebSocket connections
- **Presence Indicators** - See who's online and what they're editing
- **Task Management** - Create, assign, and track project tasks
- **Team Projects** - Organize work into collaborative projects
- **User Management** - Secure authentication and user profiles

### ⚡ Real-Time Features (Next Phase)
- 🔥 **Live Document Updates** - See changes as they happen
- 👥 **"Alex is editing..."** - Real-time presence indicators
- 💬 **Instant Notifications** - Get notified about important updates
- 📊 **Collaborative Editing** - Multiple users can edit simultaneously


## 📁 Project Structure

```
collablite/
├── apps/
│   ├── server/                 # Backend GraphQL API
│   │   ├── src/
│   │   │   ├── models/         # MongoDB schemas (User, Project, Task)
│   │   │   ├── graphql/        # GraphQL schema and resolvers
│   │   │   ├── dataloaders/    # DataLoader instances for N+1 prevention
│   │   │   └── index.ts        # Server entry point
│   │   └── package.json
│   │
│   └── web/                    # Frontend React application
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── graphql/        # GraphQL queries and mutations
│       │   └── main.tsx        # App entry point
│       ├── index.html
│       └── vite.config.ts
│
├── package.json                # Root package.json (monorepo)
└── pnpm-workspace.yaml         # PNPM workspace configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+**
- **PNPM 8+** (`npm install -g pnpm`)
- **MongoDB Atlas Account** (Free tier works great!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/collablite.git
   cd collablite
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cd apps/server
   cp .env.example .env
   ```
   
   Edit `.env` with your MongoDB Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   PORT=4000
   ```

4. **Configure MongoDB Atlas**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Whitelist IP address: `0.0.0.0/0` (or your specific IP)
   - Create database user with read/write permissions
   - Get your connection string

### Running the Application

**Development mode (both frontend and backend):**
```bash
pnpm dev
```

**Backend only:**
```bash
cd apps/server
pnpm dev
```

**Frontend only:**
```bash
cd apps/web
pnpm dev
```

## 📡 API Documentation

### GraphQL Endpoints
- **Playground**: `http://localhost:4000/graphql`
- **Health Check**: `http://localhost:4000/health`

### Example Queries

**Create a user:**
```graphql
mutation {
  createUser(
    username: "johndoe",
    email: "john@example.com",
    password: "secure123"
  ) {
    id
    username
    email
    createdAt
  }
}
```

**Create a project:**
```graphql
mutation {
  createProject(
    name: "Website Redesign",
    description: "Redesign company website",
    ownerId: "USER_ID"
  ) {
    id
    name
    description
    owner {
      username
    }
  }
}
```

**Real-time task updates (subscription):**
```graphql
subscription {
  taskUpdated(projectId: "PROJECT_ID") {
    id
    title
    completed
    assignee {
      username
    }
  }
}
```

## 🏆 Best Practices Implemented

### Backend Architecture
- **Thin Resolvers, Fat Services** - Business logic separated from GraphQL layer
- **DataLoader Pattern** - Prevents N+1 query problems with efficient batching
- **Schema-First Design** - GraphQL schema as source of truth
- **Input Validation** - Comprehensive validation at resolver level
- **Error Handling** - Structured error responses and logging

### Frontend Architecture
- **Component Composition** - Reusable, composable React components
- **Custom Hooks** - Logic encapsulation and reusability
- **Optimistic UI** - Immediate feedback for better UX
- **Code Splitting** - Efficient bundle loading
- **Type Safety** - End-to-end TypeScript integration

### Real-Time Architecture (Next Phase)
- **WebSocket Connections** - Efficient real-time communication
- **Subscription Management** - Clean subscription lifecycle
- **Connection Pooling** - Efficient resource utilization
- **Graceful Degradation** - Fallbacks when real-time features unavailable

## 🔧 Development Scripts

### Root Level
```bash
pnpm dev          # Start both frontend and backend
pnpm build        # Build all packages
pnpm test         # Run tests across packages
```

### Server
```bash
cd apps/server
pnpm dev          # Start GraphQL server
pnpm build        # Build TypeScript
pnpm start        # Start production server
```

### Web
```bash
cd apps/web
pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

## 📊 Performance Optimizations

### Backend
- **Query Batching** - Multiple queries in single request
- **Caching Strategy** - Redis integration ready
- **Connection Pooling** - Efficient database connections
- **Request Batching** - DataLoader reduces database calls

### Frontend
- **Code Splitting** - Route-based and component-based
- **Image Optimization** - Automatic format selection
- **Bundle Analysis** - Built-in bundle size monitoring
- **Caching Strategy** - Apollo Client cache configuration

## 🔒 Security

- **JWT Authentication** - Secure token-based authentication
- **Input Sanitization** - Protection against injection attacks
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Controlled cross-origin requests
- **Environment Variables** - Sensitive data protection

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test suites
pnpm test:server
pnpm test:web
```

## 📈 Deployment

### Backend Deployment (Render/Railway)
```bash
# 1. Push to GitHub
# 2. Connect to Render/Railway
# 3. Set environment variables
# 4. Deploy!
```

### Frontend Deployment (Vercel/Netlify)
```bash
# 1. Build the frontend
cd apps/web && pnpm build

# 2. Deploy dist folder to your preferred platform
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style
- **TypeScript** - Strict mode enabled
- **ESLint** - Consistent code style
- **Prettier** - Automated code formatting
- **Commit Hooks** - Pre-commit validation

## 📚 Learning Resources

- [GraphQL Official Docs](https://graphql.org/learn/)
- [Apollo GraphQL Tutorial](https://www.apollographql.com/tutorials/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)

## 🎯 Roadmap

### Phase 1 (Current)
- Basic project/task management
- Real-time updates with subscriptions
- User authentication
- MongoDB integration

### Phase 2 (Future)
- File uploads and document sharing
- Advanced permission system
- Real-time chat within projects
- Calendar integration

### Phase 3 (Future)
- AI-powered task suggestions
- Advanced analytics dashboard
- Mobile applications
- Third-party integrations (Slack, Google Calendar)


## 🙏 Acknowledgments

- [Apollo GraphQL](https://www.apollographql.com/) for amazing GraphQL tools
- [MongoDB](https://www.mongodb.com/) for the free Atlas tier
- [Vite](https://vitejs.dev/) for the incredible dev experience
- [PNPM](https://pnpm.io/) for efficient monorepo management

---

*Real collaboration, simplified.*

---

<div align="center">
  <img src="https://img.shields.io/github/stars/Rami24t/collablite?style=social" alt="GitHub Stars">
  <img src="https://img.shields.io/github/forks/Rami24t/collablite?style=social" alt="GitHub Forks">
</div>
