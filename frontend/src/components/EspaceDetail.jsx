import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  espaceService,
  reservationService,
  typeEvenementService,
} from "../services/api";

const EspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [espace, setEspace] = useState(null);
  const [typesEvenements, setTypesEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    date_debut: "",
    date_fin: "",
    type_evenement: "",
  });

  useEffect(() => {
    Promise.all([espaceService.getById(id), typeEvenementService.getAll()])
      .then(([resEspace, resTypes]) => {
        setEspace(resEspace.data);
        setTypesEvenements(resTypes.data);
        if (resTypes.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            type_evenement: resTypes.data[0].id,
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Erreur lors de la récupération des détails de l'espace.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Vous devez être connecté pour effectuer une réservation.");
      return;
    }

    try {
      await reservationService.create({
        espace: espace.id,
        type_evenement: formData.type_evenement,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
      });

      setSuccess("Réservation effectuée avec succès !");
      setTimeout(() => navigate("/mes-reservations"), 1500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const serverErrors = err.response.data;
        const msg =
          typeof serverErrors === "object"
            ? JSON.stringify(serverErrors)
            : serverErrors;
        setError(`Erreur lors de la réservation : ${msg}`);
      } else {
        setError("Erreur lors de la réservation. Vérifiez les dates saisies.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!espace)
    return (
      <div className="alert alert-danger container mt-4">
        Espace introuvable.
      </div>
    );

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-7 mb-4">
          <img
            src={espace.image_url || "https://via.placeholder.com/600x400"}
            alt={espace.nom}
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
          <h2 className="mt-3 fw-bold">{espace.nom}</h2>
          <p className="text-muted">
            <i className="bi bi-geo-alt-fill me-1"></i>
            {espace.adresse}
          </p>
          <p className="lead">{espace.description}</p>
          <div className="d-flex gap-3 my-3">
            <span className="badge bg-primary fs-6 p-2">
              Tarif : {espace.prix_par_heure} € / heure
            </span>
            <span className="badge bg-secondary fs-6 p-2">
              Capacité max : {espace.capacite_max} personnes
            </span>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h4 className="card-title mb-3 fw-bold">Réserver cet espace</h4>
              {error && <div className="alert alert-danger mb-3">{error}</div>}
              {success && (
                <div className="alert alert-success mb-3">{success}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Type d'événement</label>
                  <select
                    className="form-select"
                    name="type_evenement"
                    value={formData.type_evenement}
                    onChange={handleChange}
                    required
                  >
                    {typesEvenements.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.libelle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Date & Heure de début</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="date_debut"
                    value={formData.date_debut}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Date & Heure de fin</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="date_fin"
                    value={formData.date_fin}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 mt-3 fw-semibold"
                >
                  Confirmer la réservation
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EspaceDetail;
