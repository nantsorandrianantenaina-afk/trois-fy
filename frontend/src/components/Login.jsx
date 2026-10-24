import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await authService.login(formData);

      const accessToken = response.data?.access;
      const refreshToken = response.data?.refresh;

      if (!accessToken || !refreshToken) {
        throw new Error("Tokens JWT absents dans la réponse.");
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Erreur de connexion :", err);

      if (err.response?.status === 401) {
        setError("Adresse email ou mot de passe incorrect.");
      } else if (err.response) {
        setError("Erreur du serveur. Vérifiez vos identifiants.");
      } else if (err.message === "Tokens JWT absents dans la réponse.") {
        setError("La réponse du serveur est incomplète. Réessayez.");
      } else {
        setError("Impossible de se connecter au serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-4"
      style={{ background: "#f5f7fb" }}
    >
      <div
        className="card border-0 shadow-sm"
        style={{ width: "420px", maxWidth: "92%" }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/", { replace: true })}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Retour à la page À propos
            </button>
          </div>

          <div className="text-center mb-4">
            <div
              className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "60px",
                height: "60px",
              }}
            >
              <i className="bi bi-building fs-3"></i>
            </div>

            <h3 className="fw-bold mb-1">ESPACES TROIS FY</h3>

            <p className="text-muted mb-0">
              Connexion à votre espace de gestion
            </p>
          </div>

          {error && (
            <div
              className="alert alert-danger d-flex align-items-center"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Adresse email
              </label>

              <input
                id="email"
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@gmail.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              Vous n'avez pas encore de compte ?
            </small>

            <br />

            <Link to="/register" className="text-decoration-none fw-semibold">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
