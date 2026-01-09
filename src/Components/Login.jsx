import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated RGB Background */}
      <div className="rgb-background">
        <div className="rgb-circle rgb-circle-1"></div>
        <div className="rgb-circle rgb-circle-2"></div>
        <div className="rgb-circle rgb-circle-3"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-card-glow"></div>
        
        <div className="login-header">
          <div className="logo-container">
            <img src="/logo.png" alt="EduSpark" className="logo-image" />
          </div>
          <h2 className="login-title">Welcome</h2>
          <p className="login-subtitle">Education and Energy, Inspiration and Creativity</p>
        </div>

        {error && (
          <div className="alert alert-danger rgb-alert" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-rgb">
            <label htmlFor="email" className="form-label-rgb">
              <i className="bi bi-envelope-fill"></i>
              Email Address
            </label>
            <input
              type="email"
              className="form-control-rgb"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@eduspark.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group-rgb">
            <label htmlFor="password" className="form-label-rgb">
              <i className="bi bi-lock-fill"></i>
              Password
            </label>
            <input
              type="password"
              className="form-control-rgb"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-rgb"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="rgb-line"></div>
          <p className="footer-text">Secure Admin Access</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* RGB Animated Background */
        .rgb-background {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .rgb-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.6;
          animation: float 20s infinite ease-in-out;
        }

        .rgb-circle-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0, 173, 239, 0.6), transparent);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .rgb-circle-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 165, 0, 0.6), transparent);
          bottom: -100px;
          right: -100px;
          animation-delay: 5s;
        }

        .rgb-circle-3 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.5), transparent);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }

        /* Login Card */
        .login-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          padding: 3rem;
          background: rgba(20, 20, 20, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .login-card-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            135deg,
            rgba(0, 173, 239, 0.5),
            rgba(255, 165, 0, 0.5),
            rgba(255, 215, 0, 0.4)
          );
          border-radius: 24px;
          z-index: -1;
          opacity: 0.3;
          filter: blur(10px);
          animation: glow-pulse 3s infinite;
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-container {
          width: 120px;
          height: 120px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 30px rgba(0, 173, 239, 0.6))
                  drop-shadow(0 0 60px rgba(255, 165, 0, 0.4));
          animation: logo-glow 3s ease-in-out infinite;
        }

        @keyframes logo-glow {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(0, 173, 239, 0.6))
                    drop-shadow(0 0 60px rgba(255, 165, 0, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(0, 173, 239, 0.8))
                    drop-shadow(0 0 80px rgba(255, 165, 0, 0.6));
          }
        }

        .login-title {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #00ADEF, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          margin: 0;
        }

        /* Form */
        .login-form {
          margin-bottom: 2rem;
        }

        .form-group-rgb {
          margin-bottom: 1.5rem;
        }

        .form-label-rgb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .form-label-rgb i {
          background: linear-gradient(135deg, #00ADEF, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .form-control-rgb {
          width: 100%;
          padding: 0.875rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-control-rgb:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 173, 239, 0.6);
          box-shadow: 
            0 0 0 3px rgba(0, 173, 239, 0.15),
            0 0 20px rgba(0, 173, 239, 0.3);
        }

        .form-control-rgb::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-control-rgb:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Button */
        .btn-rgb {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #00ADEF, #0088CC);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 4px 15px rgba(0, 173, 239, 0.4),
            0 0 30px rgba(0, 173, 239, 0.3);
        }

        .btn-rgb::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .btn-rgb:hover::before {
          transform: translateX(100%);
        }

        .btn-rgb:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 6px 25px rgba(0, 173, 239, 0.6),
            0 0 40px rgba(0, 173, 239, 0.4);
        }

        .btn-rgb:active {
          transform: translateY(0);
        }

        .btn-rgb:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Alert */
        .rgb-alert {
          background: rgba(220, 53, 69, 0.2);
          border: 1px solid rgba(220, 53, 69, 0.4);
          color: #ff6b7a;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
        }

        /* Footer */
        .login-footer {
          text-align: center;
        }

        .rgb-line {
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 173, 239, 0.6),
            rgba(255, 165, 0, 0.6),
            rgba(255, 215, 0, 0.5),
            transparent
          );
          margin-bottom: 1rem;
        }

        .footer-text {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .login-card {
            padding: 2rem 1.5rem;
            margin: 1rem;
          }

          .logo-circle {
            width: 60px;
            height: 60px;
          }

          .logo-text {
            font-size: 2rem;
          }

          .login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;

