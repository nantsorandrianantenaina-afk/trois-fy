import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { espaceService } from "../services/api";

const EspaceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    capacite_max: "",
    adresse: "",
    image_url: "",
    est_actif: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  /*
  |--------------------------------------------------------------------------
  | Charger l'espace
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadEspace = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await espaceService.getById(id);

        const espace = response.data;

        setFormData({
          nom: espace.nom || "",
          description: espace.description || "",
          capacite_max: espace.capacite_max || "",
          adresse: espace.adresse || "",
          image_url: espace.image_url || "",
          est_actif: Boolean(espace.est_actif),
        });
      } catch (err) {
        console.error("Erreur lors du chargement de l'espace :", err);

        if (err.response?.status === 401) {
          setError("Votre session a expiré. Veuillez vous reconnecter.");
        } else if (err.response?.status === 404) {
          setError("Cet espace n'existe pas.");
        } else {
          setError("Impossible de charger cet espace.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadEspace();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Modification
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom de l'espace est obligatoire.";
    }

    if (!formData.capacite_max) {
      newErrors.capacite_max = "La capacité est obligatoire.";
    } else if (Number(formData.capacite_max) < 1) {
      newErrors.capacite_max = "La capacité doit être supérieure ou égale à 1.";
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = "L'adresse est obligatoire.";
    }

    if (formData.image_url.trim()) {
      try {
        new URL(formData.image_url);
      } catch {
        newErrors.image_url = "Veuillez saisir une URL valide.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
  |--------------------------------------------------------------------------
  | Enregistrer
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const data = {
        nom: formData.nom.trim(),

        description: formData.description.trim() || null,

        capacite_max: Number(formData.capacite_max),

        adresse: formData.adresse.trim(),

        image_url: formData.image_url.trim() || null,

        est_actif: formData.est_actif,
      };

      await espaceService.update(id, data);

      setSuccess("Les modifications ont été enregistrées.");

      setTimeout(() => {
        navigate("/espaces");
      }, 700);
    } catch (err) {
      console.error("Erreur lors de la modification :", err);

      if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else if (err.response?.data) {
        const backendErrors = {};

        Object.keys(err.response.data).forEach((field) => {
          const value = err.response.data[field];

          if (Array.isArray(value)) {
            backendErrors[field] = value[0];
          } else if (typeof value === "string") {
            backendErrors[field] = value;
          }
        });

        setErrors(backendErrors);

        setError("Veuillez vérifier les informations saisies.");
      } else {
        setError("Impossible de modifier cet espace.");
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Chargement
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="espace-edit-loading">
        <div className="spinner-border text-primary mb-3">
          <span className="visually-hidden">Chargement...</span>
        </div>

        <p className="text-muted mb-0">Chargement de l'espace...</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Erreur de chargement
  |--------------------------------------------------------------------------
  */

  if (error && !formData.nom) {
    return (
      <div>
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/espaces")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour aux espaces
        </button>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Rendu
  |--------------------------------------------------------------------------
  */

  return (
    <div className="espace-form-page">
      {/* En-tête */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <div className="espace-title-icon me-3">
            <i className="bi bi-pencil-square"></i>
          </div>

          <div>
            <h2 className="fw-bold mb-0">Modifier l'espace</h2>

            <small className="text-muted">
              Modification de <strong>{formData.nom}</strong>
            </small>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-light border"
            onClick={() => navigate("/espaces")}
            disabled={saving}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Retour
          </button>

          <button
            type="submit"
            form="edit-espace-form"
            className="btn btn-primary espace-gradient-button px-4"
            disabled={saving}
          >
            {saving ? (
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
        <div className="alert alert-danger py-2">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </div>
      )}

      <form id="edit-espace-form" onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 px-4 py-3">
            <div className="d-flex align-items-center">
              <div className="espace-section-icon me-3">
                <i className="bi bi-info-circle"></i>
              </div>

              <div>
                <h5 className="fw-bold mb-0">Informations générales</h5>

                <small className="text-muted">
                  Modifiez les informations de cet espace.
                </small>
              </div>
            </div>
          </div>

          <div className="card-body p-4">
            <div className="row g-3">
              {/* Nom */}

              <div className="col-md-6">
                <label htmlFor="nom" className="form-label fw-semibold">
                  Nom de l'espace *
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-building"></i>
                  </span>

                  <input
                    id="nom"
                    type="text"
                    name="nom"
                    className={`form-control ${errors.nom ? "is-invalid" : ""}`}
                    value={formData.nom}
                    onChange={handleChange}
                    maxLength={150}
                  />
                </div>

                {errors.nom && (
                  <div className="text-danger small mt-1">{errors.nom}</div>
                )}
              </div>

              {/* Capacité */}

              <div className="col-md-6">
                <label
                  htmlFor="capacite_max"
                  className="form-label fw-semibold"
                >
                  Capacité maximale *
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-people"></i>
                  </span>

                  <input
                    id="capacite_max"
                    type="number"
                    name="capacite_max"
                    className={`form-control ${
                      errors.capacite_max ? "is-invalid" : ""
                    }`}
                    value={formData.capacite_max}
                    onChange={handleChange}
                    min="1"
                  />

                  <span className="input-group-text">personnes</span>
                </div>

                {errors.capacite_max && (
                  <div className="text-danger small mt-1">
                    {errors.capacite_max}
                  </div>
                )}
              </div>

              {/* Adresse */}

              <div className="col-md-6">
                <label htmlFor="adresse" className="form-label fw-semibold">
                  Adresse *
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-geo-alt"></i>
                  </span>

                  <input
                    id="adresse"
                    type="text"
                    name="adresse"
                    className={`form-control ${
                      errors.adresse ? "is-invalid" : ""
                    }`}
                    value={formData.adresse}
                    onChange={handleChange}
                    maxLength={255}
                  />
                </div>

                {errors.adresse && (
                  <div className="text-danger small mt-1">{errors.adresse}</div>
                )}
              </div>

              {/* Prix */}

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

                <small className="text-muted">Tarif fixé par le système.</small>
              </div>

              {/* Description */}

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
                  rows="3"
                />
              </div>

              {/* Image */}

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
                    type="url"
                    name="image_url"
                    className={`form-control ${
                      errors.image_url ? "is-invalid" : ""
                    }`}
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

              {/* Statut */}

              <div className="col-12">
                <div className="espace-status-box">
                  <div className="d-flex align-items-center">
                    <div className="espace-status-icon me-3">
                      <i className="bi bi-toggle-on"></i>
                    </div>

                    <div>
                      <div className="fw-semibold">Disponibilité</div>

                      <small className="text-muted">
                        Activez ou désactivez cet espace.
                      </small>
                    </div>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      id="est_actif"
                      type="checkbox"
                      name="est_actif"
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

export default EspaceEdit;
