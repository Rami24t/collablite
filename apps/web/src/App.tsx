import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import ServerHealth from "./components/ServerHealth";
import "./App.css";

// Define GraphQL queries and mutations
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      createdAt
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      id
      username
      email
      createdAt
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function App() {
  // State for server connection
  const [serverConnected, setServerConnected] = useState(true);

  // State for success messages
  const [successMessage, setSuccessMessage] = useState("");

  // State for form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // State for the specific user being currently deleted
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Queries
  const { data, loading, error, refetch } = useQuery(GET_USERS);

  // Mutations
  const [createUser, { loading: creatingUser, error: createError }] =
    useMutation(CREATE_USER, {
      refetchQueries: [{ query: GET_USERS }],
    });
  const [deleteUser, { loading: deletingUser, error: deleteError }] =
    useMutation(DELETE_USER, {
      refetchQueries: [{ query: GET_USERS }],
    });

  // Handle creating random test user
  const handleCreateTestUser = async () => {
    try {
      const result = await createUser({
        variables: {
          username: `user${Math.floor(Math.random() * 1000)}`,
          email: `test${Math.floor(Math.random() * 1000)}@example.com`,
          password: "password123",
        },
      });

      if (result.data?.createUser) {
        setSuccessMessage(
          `User "${result.data.createUser.username}" created successfully!`,
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId: string, username: string) => {
    if (
      !window.confirm(`Are you sure you want to delete user "${username}"?`)
    ) {
      return;
    }
    try {
      setDeletingUserId(userId);
      const result = await deleteUser({
        variables: { id: userId },
      });

      if (result.data?.deleteUser === true) {
        setSuccessMessage(`User "${username}" deleted successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setDeletingUserId(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createUser({
        variables: formData,
      });

      if (result.data?.createUser) {
        setSuccessMessage(
          `User "${result.data.createUser.username}" created successfully!`,
        );
        setTimeout(() => setSuccessMessage(""), 3000);
        setFormData({ username: "", email: "", password: "" });
      }
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  // Clear form
  const handleClearForm = () => {
    setFormData({ username: "", email: "", password: "" });
  };

  if (!serverConnected) {
    return (
      <div className="app">
        <h1>CollabLite</h1>
        <ServerHealth onConnectionChange={setServerConnected} />
        <div className="error-message">
          <h2>Backend Server Required</h2>
          <p>Please make sure your backend server is running:</p>
          <code>cd apps/server && pnpm dev</code>
          <p>
            The server should start on <strong>http://localhost:4000</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>CollabLite</h1>
      <ServerHealth onConnectionChange={setServerConnected} />

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}

      {/* Create User Form */}
      <div className="create-user-form">
        <h2>Create New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              minLength={3}
              className="form-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={creatingUser}
              className="submit-btn"
            >
              {creatingUser ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              className="clear-btn"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Create Random User Button */}
        <div className="random-user-section">
          <p>Or create a random test user:</p>
          <button
            onClick={handleCreateTestUser}
            disabled={creatingUser}
            className="random-user-btn"
          >
            {creatingUser ? "Creating..." : "Create Random Test User"}
          </button>
        </div>

        {/* Mutation Error Display */}
        {createError && (
          <div className="mutation-error">
            <h3>Error creating user:</h3>
            <p>{createError.message}</p>
          </div>
        )}

        {deleteError && (
          <div className="mutation-error">
            <h3>Error deleting user:</h3>
            <p>{deleteError.message}</p>
          </div>
        )}
      </div>

      {/* Users List Section */}
      <div className="users-section">
        {loading && <div className="loading">Loading users...</div>}

        {error && (
          <div className="error">
            <h2>Error loading users</h2>
            <p>{error.message}</p>
            <button onClick={() => refetch()}>Retry</button>
          </div>
        )}

        {data && (
          <div className="users-container">
            <div className="users-header">
              <h2>Users ({data.users.length})</h2>
              <button onClick={() => refetch()} className="refresh-btn">
                Refresh List
              </button>
            </div>

            {data.users.length === 0 ? (
              <div className="empty-state">
                <p>No users found. Create your first user above!</p>
              </div>
            ) : (
              <div className="users-list">
                {data.users.map((user: User) => (
                  <div key={user.id} className="user-card">
                    <div className="user-header">
                      <h3>{user.username}</h3>
                      <span className="user-id">ID: {user.id.slice(-6)}</span>
                    </div>
                    <p className="user-email">{user.email}</p>
                    <small className="user-joined">
                      Joined:{" "}
                      {new Date(Number(user.createdAt)).toLocaleDateString(
                        "GER",
                      )}{" "}
                      at{" "}
                      {new Date(Number(user.createdAt)).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>

                    <div className="user-actions">
                      <button 
                        className="delete-user-btn"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        disabled={deletingUser && deletingUserId === user.id}
                      >
                        {deletingUser && deletingUserId === user.id ? (
                          <>
                            <span className="spinner small"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <span className="delete-icon">🗑️</span>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
