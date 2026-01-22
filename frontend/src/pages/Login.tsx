import React, { useState, FormEvent } from 'react';
import { useUser } from '../hooks/useUser';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username.length < 2 || username.length > 20) {
      setError('Username must be 2-20 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <span className="icon icon-lg icon-brain"></span>
          </div>
          <h1>Human Benchmark</h1>
          <p>Test and improve your cognitive abilities</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Choose a username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
              disabled={isLoading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Get Started'}
          </button>
        </form>
        
        <div className="login-features">
          <div className="feature">
            <span className="feature-icon icon icon-bolt"></span>
            <span>Reaction Time</span>
          </div>
          <div className="feature">
            <span className="feature-icon icon icon-target"></span>
            <span>Aim Trainer</span>
          </div>
          <div className="feature">
            <span className="feature-icon icon icon-chart"></span>
            <span>Track Progress</span>
          </div>
          <div className="feature">
            <span className="feature-icon icon icon-trophy"></span>
            <span>Leaderboards</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
