import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { espaceService } from "../services/api";

const EspaceForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    capacite_max: "",
    adresse: "",
    image_url: "",
    est_actif: true,
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({ ...previous, [name]: "" }));
    setError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom de l'espace est obligatoire.";
    }

    if (
      !formData.capacite_max ||
      !Number.isInteger(Number(formData.capacite_max)) ||
      Number(formData.capacite_max) < 1
    ) {
      newErrors.capacite_max =
        "Saisissez une capacité entière supérieure à zéro.";
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = "L'adresse est obligatoire.";
    }

    if (formData.image_url.trim()) {
      try {
        const url = new URL(formData.image_url);
        if (!["http:", "https:"].includes(url.protocol)) {
          newErrors.image_url = "L'URL doit commencer par http:// ou https://.";
        }
      } catch {
        newErrors.image_url = "Saisissez une URL valide.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const data = {
      nom: formData.nom.trim(),
      description: formData.description.trim() || null,
      capacite_max: Number(formData.capacite_max),
      adresse: formData.adresse.trim(),
      image_url: formData.image_url.trim() || null,
      est_actif: formData.est_actif,
    };

    try {
      setLoading(true);
      await espaceService.create(data);
      navigate("/espaces");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Accès refusé. Vérifiez votre connexion administrateur.");
      } else if (err.response?.data) {
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([field, value]) => {
          backendErrors[field] = Array.isArray(value)
            ? value.join(" ")
            : String(value);
        });
        setErrors(backendErrors);
        setError("Veuillez vérifier les informations saisies.");
      } else {
        setError("Impossible de créer l'espace. Vérifiez le serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="espace-form-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div className="d-flex align-items-center">
          <div className="espace-title-icon me-3">
            <i className="bi bi-building"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-1">Ajouter un espace</h2>
            <small className="text-muted">
              Créer un nouvel espace événementiel
            </small>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-light border"
            onClick={() => navigate("/espaces")}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Retour
          </button>
          <button
            type="submit"
            form="espace-form"
            className="btn btn-primary px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                ></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </div>
      )}

      <form id="espace-form" onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 px-4 pt-3 pb-2">
            <div className="d-flex align-items-center">
              <div className="espace-section-icon me-3">
                <i className="bi bi-info-circle"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1">Informations générales</h5>
                <small className="text-muted">
                  Renseignez les informations de l'espace.
                </small>
              </div>
            </div>
          </div>

          <div className="card-body px-4 pt-3 pb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="nom" className="form-label fw-semibold">
                  Nom de l'espace <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-building"></i>
                  </span>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    className={`form-control ${errors.nom ? "is-invalid" : ""}`}
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Ex : Grande Salle"
                    maxLength={150}
                    required
                  />
                </div>
                {errors.nom && (
                  <div className="text-danger small mt-1">{errors.nom}</div>
                )}
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="capacite_max"
                  className="form-label fw-semibold"
                >
                  Capacité maximale <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-people"></i>
                  </span>
                  <input
                    id="capacite_max"
                    name="capacite_max"
                    type="number"
                    className={`form-control ${errors.capacite_max ? "is-invalid" : ""}`}
                    value={formData.capacite_max}
                    onChange={handleChange}
                    placeholder="Ex : 400"
                    min="1"
                    step="1"
                    required
                  />
                  <span className="input-group-text">personnes</span>
                </div>
                {errors.capacite_max && (
                  <div className="text-danger small mt-1">
                    {errors.capacite_max}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="adresse" className="form-label fw-semibold">
                  Adresse <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                  <input
                    id="adresse"
                    name="adresse"
                    type="text"
                    className={`form-control ${errors.adresse ? "is-invalid" : ""}`}
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Ex : Au Centre"
                    maxLength={255}
                    required
                  />
                </div>
                {errors.adresse && (
                  <div className="text-danger small mt-1">{errors.adresse}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Prix par personne
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-cash-stack"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value="4 000"
                    readOnly
                  />
                  <span className="input-group-text">Ar</span>
                </div>
                <small className="text-muted">
                  Tarif de base fixé par le système.
                </small>
              </div>

              <div className="col-md-7">
                <label htmlFor="description" className="form-label fw-semibold">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez brièvement cet espace..."
                  rows="3"
                />
              </div>

              <div className="col-md-5">
                <label htmlFor="image_url" className="form-label fw-semibold">
                  URL de l'image
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-image"></i>
                  </span>
                  <input
                    id="image_url"
                    name="image_url"
                    type="url"
                    className={`form-control ${errors.image_url ? "is-invalid" : ""}`}
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
                {errors.image_url && (
                  <div className="text-danger small mt-1">
                    {errors.image_url}
                  </div>
                )}
              </div>

              <div className="col-12">
                <div className="espace-status-box d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center">
                    <div className="espace-status-icon me-3">
                      <i className="bi bi-toggle-on"></i>
                    </div>
                    <div>
                      <div className="fw-semibold">
                        Disponibilité de l'espace
                      </div>
                      <small className="text-muted">
                        Un espace actif peut être utilisé pour une nouvelle
                        réservation.
                      </small>
                    </div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      id="est_actif"
                      name="est_actif"
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.est_actif}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="est_actif"
                      className="form-check-label fw-semibold"
                    >
                      {formData.est_actif ? "Actif" : "Inactif"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EspaceForm;
