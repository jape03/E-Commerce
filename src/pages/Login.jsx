import { useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login({ onAuthSuccess, user }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response =
        mode === "login"
          ? await api.login({ email: formData.email, password: formData.password })
          : await api.register({ name: formData.name, email: formData.email, password: formData.password });
      await onAuthSuccess(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="panel" style={{ maxWidth: "520px", margin: "40px auto" }}>
        <h2>{mode === "login" ? "Login to Continue" : "Create an Account"}</h2>
        <form onSubmit={submit}>
          {mode === "register" ? (
            <div style={{ marginBottom: "16px" }}>
              <label>Full Name</label>
              <input
                className="input"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          ) : null}

          <div style={{ marginBottom: "16px" }}>
            <label>Email</label>
            <input
              className="input"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Password</label>
            <input
              className="input"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error ? <p style={{ color: "#b42318", marginBottom: "12px" }}>{error}</p> : null}
          <button className="btn-checkout" type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: "var(--shopee-orange)", borderColor: "var(--shopee-orange)" }}
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login" ? "Create account" : "Have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
