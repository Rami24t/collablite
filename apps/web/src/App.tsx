import React from 'react'
import { gql, useQuery } from '@apollo/client'

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      createdAt
    }
  }
`

export default function App() {
  const { data, loading, error } = useQuery(GET_USERS)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>CollabLite</h1>
      <div>
        <h2>Users</h2>
        {data?.users.map((user: any) => (
          <div key={user.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{user.username}</h3>
            <p>{user.email}</p>
            <small>Joined: {new Date(user.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  )
}