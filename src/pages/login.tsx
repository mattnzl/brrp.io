import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../services/auth';
import { UserRole } from '../types';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = AuthService.login(username, password);
      
      if (session) {
        // Store session in localStorage for persistence
        localStorage.setItem('authSession', JSON.stringify(session));
        
        // Redirect based on role
        if (session.user.role === UserRole.ADMIN) {
          router.push('/admin');
        } else if (session.user.role === UserRole.CUSTOMER) {
          router.push('/customer');
        } else if (session.user.role === UserRole.DRIVER) {
          router.push('/driver');
        } else {
          router.push('/');
        }
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - BRRP.IO</title>
        <meta name="description" content="Login to BRRP.IO Waste Jobs Management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <div className="login-card">
          <div className="logo">
            <h1>BRRP.IO</h1>
            <p className="tagline">Waste Jobs Management</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <h2>Login</h2>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <div className="demo-credentials">
              <p><strong>Demo Credentials:</strong></p>
              <p>Admin: <code>admin</code> / (any password)</p>
              <p>Customer: <code>wmnz_customer</code> / (any password)</p>
              <p>Driver: <code>driver1</code> / (any password)</p>
            </div>
          </form>
        </div>

        <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            padding: 2rem;
          }

          .login-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            max-width: 450px;
            width: 100%;
          }

          .logo {
            text-align: center;
            margin-bottom: 2rem;
          }

          .logo h1 {
            margin: 0;
            font-size: 3rem;
            font-weight: bold;
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .tagline {
            margin: 0.5rem 0 0 0;
            font-size: 1.1rem;
            color: #fbbf24;
          }

          .login-form h2 {
            color: white;
            margin: 0 0 1.5rem 0;
            text-align: center;
            font-size: 1.8rem;
          }

          .error-message {
            padding: 1rem;
            margin-bottom: 1.5rem;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            border-radius: 6px;
            color: #fca5a5;
            font-weight: 500;
            text-align: center;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: white;
          }

          input {
            width: 100%;
            padding: 0.875rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.2);
            color: white;
            font-size: 1rem;
            transition: all 0.3s;
          }

          input:focus {
            outline: none;
            border-color: #fbbf24;
            background: rgba(0, 0, 0, 0.3);
          }

          input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .login-btn {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            border: none;
            border-radius: 8px;
            color: #1e3a8a;
            font-weight: bold;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 1.5rem;
          }

          .login-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
          }

          .login-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .demo-credentials {
            padding: 1rem;
            background: rgba(251, 191, 36, 0.1);
            border-left: 4px solid #fbbf24;
            border-radius: 6px;
            font-size: 0.9rem;
            color: white;
          }

          .demo-credentials p {
            margin: 0.25rem 0;
          }

          .demo-credentials code {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: monospace;
            color: #fbbf24;
          }

          @media (max-width: 768px) {
            .login-card {
              padding: 2rem;
            }

            .logo h1 {
              font-size: 2.5rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
