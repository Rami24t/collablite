import React, { useState, useEffect } from 'react';

interface ServerHealthProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const ServerHealth: React.FC<ServerHealthProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const connected = data.mongodb === 'connected';
        setIsConnected(connected);
        onConnectionChange?.(connected);
      } else {
        setIsConnected(false);
        onConnectionChange?.(false);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setIsConnected(false);
      onConnectionChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="server-status loading">Checking server connection...</div>;
  }

  return (
    <div className={`server-status ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? (
        <>
          <span className="status-dot connected"></span>
          Server connected
        </>
      ) : (
        <>
          <span className="status-dot disconnected"></span>
          Server disconnected - Make sure backend is running on port 4000
        </>
      )}
      <button onClick={checkHealth} className="retry-btn">
        Retry
      </button>
    </div>
  );
};

export default ServerHealth;