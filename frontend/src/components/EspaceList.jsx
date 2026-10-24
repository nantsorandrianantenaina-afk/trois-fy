import React, { useEffect, useState } from "react";
import { espaceService } from "../services/api";
import { Link } from "react-router-dom";

const EspaceList = () => {
  const [espaces, setEspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    espaceService
      .getAll()
      .then((res) => {
        setEspaces(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des espaces:", err);
        setError(
          "Impossible de charger les espaces. Assurez-vous que le serveur Django est démarré.",
        );
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4 font-weight-bold">Nos Espaces Disponibles</h2>
      <div className="row">
        {espaces.map((espace) => (
          <div className="col-md-4 mb-4" key={espace.id}>
            <div className="card h-100 shadow-sm border-0">
              <img
                src={espace.image_url || "https://via.placeholder.com/300x200"}
                className="card-img-top"
                alt={espace.nom}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold">{espace.nom}</h5>
                <p className="card-text text-muted small">{espace.adresse}</p>
                <p className="card-text flex-grow-1">
                  {espace.description.length > 90
                    ? `${espace.description.substring(0, 90)}...`
                    : espace.description}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="badge bg-success fs-6">
                    {espace.prix_par_heure} € / heure
                  </span>
                  <small className="text-muted">
                    <i className="bi bi-people-fill me-1"></i>
                    Max {espace.capacite_max} pers.
                  </small>
                </div>
                <Link
                  to={`/espaces/${espace.id}`}
                  className="btn btn-primary mt-3 w-100"
                >
                  Voir détails & Réserver
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EspaceList;
