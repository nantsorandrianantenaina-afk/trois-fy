import React, { useEffect, useState } from "react";
import { reservationService } from "../services/api";

const MesReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reservationService
      .getAll()
      .then((res) => {
        setReservations(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger vos réservations.");
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Mes Réservations</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {reservations.length === 0 ? (
        <div className="alert alert-info">
          Vous n'avez effectué aucune réservation pour le moment.
        </div>
      ) : (
        <div className="table-responsive bg-white shadow-sm rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Espace</th>
                <th>Événement</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Prix Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id}>
                  <td>#{res.id}</td>
                  <td className="fw-semibold">
                    {res.espace_detail?.nom || `Espace #${res.espace}`}
                  </td>
                  <td>
                    {res.type_evenement_detail?.libelle || res.type_evenement}
                  </td>
                  <td>{new Date(res.date_debut).toLocaleString("fr-FR")}</td>
                  <td>{new Date(res.date_fin).toLocaleString("fr-FR")}</td>
                  <td className="fw-bold text-success">{res.prix_total} €</td>
                  <td>
                    <span
                      className={`badge ${
                        res.statut === "CONFIRMEE"
                          ? "bg-success"
                          : res.statut === "ANNULEE"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                      }`}
                    >
                      {res.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MesReservations;
