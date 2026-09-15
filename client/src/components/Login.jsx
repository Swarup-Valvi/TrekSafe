import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5050/api/auth/login",
        {
          username,
          password,
        }
      );

      if (response.data.success) {
        localStorage.setItem(
          "treksafe_user",
          JSON.stringify(response.data.user)
        );

        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="brand">
          <div className="brand-mark">T</div>
          <span>TrekSafe</span>
        </div>

        <div className="login-content">
          <p className="eyebrow">WEATHER INTELLIGENCE FOR TREKKERS</p>

          <h1>
            Plan your trek
            <br />
            around the weather.
          </h1>

          <p className="login-description">
            Check weather conditions, understand trek risk,
            and find better days to go.
          </p>
        </div>
      </div>

      <div className="login-right">

        <form className="login-card" onSubmit={handleLogin}>

          <div>
            <h2>Welcome back</h2>
            <p>Sign in to plan your next trek.</p>
          </div>

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="demo-login">
            <span>Demo account</span>
            <strong>trekker1 / trek123</strong>
          </div>

        </form>

      </div>

    </div>
  );
}

export default Login;