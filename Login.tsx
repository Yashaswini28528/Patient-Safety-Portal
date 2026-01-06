import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/apiService";
import "./Login.css";
import { toast } from "react-toastify";

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ username, password });

      if (response.token) {
        sessionStorage.setItem("token", response.token);
        onLoginSuccess(response.token);
        navigate("/dashboard", { replace: true });
        toast.success("Login successful!");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="medical-shapes">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`shape shape-${i}`}></div>
        ))}
      </div>

      <div className="login-card">
        <div className="login-header">
          <h1>PSI SAFETY</h1>
          <p className="hospital-tagline">Secure Patient Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Staff Sign In</h2>
          <p className="login-subtitle">Access your medical dashboard</p>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">
              <span className="input-icon">👤</span>
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <span className="input-icon">🔒</span>
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`login-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              <>
                <span className="btn-icon">→</span>
                Sign In to Dashboard
              </>
            )}
          </button>

          <div className="login-footer">
            <p>
              Forgot your password? <a href="/forgot-password">Reset here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
