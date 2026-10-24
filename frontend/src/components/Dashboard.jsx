import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reservationService } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await reservationService.getAll();
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
            ? response.data.results
            : [];

        setReservations(data);
      } catch (err) {
        console.error("Erreur lors du chargement des réservations :", err);

        if (err.response?.status === 401) {
          setError("Votre session a expiré. Veuillez vous reconnecter.");
        } else {
          setError("Impossible de charger les réservations.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  const totalReservations = reservations.length;

  const reservationsEnAttente = reservations.filter(
    (reservation) => reservation.statut === "EN_ATTENTE",
  ).length;

  const reservationsTerminees = reservations.filter(
    (reservation) => reservation.statut === "TERMINEE",
  ).length;

  const chiffreAffaires = reservations
    .filter((reservation) => reservation.statut === "TERMINEE")
    .reduce(
      (total, reservation) => total + Number(reservation.montant_total || 0),
      0,
    );

  const formatAriary = (montant) =>
    `${new Intl.NumberFormat("fr-FR").format(montant)} Ar`;

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return new Intl.DateTimeFormat("fr-FR").format(parsedDate);
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "En attente";
      case "CONFIRMEE":
        return "Confirmée";
      case "ANNULEE":
        return "Annulée";
      case "TERMINEE":
        return "Terminée";
      default:
        return statut || "-";
    }
  };

  const getStatutClass = (statut) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "bg-warning-subtle text-warning-emphasis";
      case "CONFIRMEE":
        return "bg-success-subtle text-success-emphasis";
      case "ANNULEE":
        return "bg-danger-subtle text-danger-emphasis";
      case "TERMINEE":
        return "bg-primary-subtle text-primary-emphasis";
      default:
        return "bg-secondary-subtle text-secondary-emphasis";
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1">Tableau de bord</h2>
          <p className="text-muted mb-0">
            Vue générale de la gestion des espaces événementiels
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/reservations")}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nouvelle réservation
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3 d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="row g-3 dashboard-stats">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body dashboard-stat-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total réservations</p>
                  <h3 className="fw-bold mb-0">
                    {loading ? "..." : totalReservations}
                  </h3>
                </div>
                <div className="bg-primary-subtle text-primary rounded-3 p-3">
                  <i className="bi bi-calendar-check fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body dashboard-stat-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">En attente</p>
                  <h3 className="fw-bold mb-0">
                    {loading ? "..." : reservationsEnAttente}
                  </h3>
                </div>
                <div className="bg-warning-subtle text-warning-emphasis rounded-3 p-3">
                  <i className="bi bi-clock-history fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body dashboard-stat-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Terminées</p>
                  <h3 className="fw-bold mb-0">
                    {loading ? "..." : reservationsTerminees}
                  </h3>
                </div>
                <div className="bg-primary-subtle text-primary rounded-3 p-3">
                  <i className="bi bi-calendar2-check fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body dashboard-stat-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Chiffre d'affaires</p>
                  <h4 className="fw-bold mb-0">
                    {loading ? "..." : formatAriary(chiffreAffaires)}
                  </h4>
                </div>
                <div className="bg-info-subtle text-info-emphasis rounded-3 p-3">
                  <i className="bi bi-cash-stack fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 dashboard-bottom">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-bold mb-0">Dernières réservations</h5>
                  <small className="text-muted">
                    Les réservations les plus récentes
                  </small>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate("/reservations")}
                >
                  Voir tout
                </button>
              </div>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-4">
                  <div
                    className="spinner-border text-primary mb-2"
                    role="status"
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="text-muted mb-0">
                    Chargement des réservations...
                  </p>
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center dashboard-empty">
                  <i className="bi bi-calendar-x fs-1 text-muted"></i>
                  <h6 className="fw-bold mt-2 mb-1">Aucune réservation</h6>
                  <p className="text-muted mb-2">
                    Aucune réservation n'a encore été enregistrée.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate("/reservations")}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Créer une réservation
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-3">Client</th>
                        <th>Espace</th>
                        <th>Date</th>
                        <th>Personnes</th>
                        <th>Montant</th>
                        <th>Statut</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...reservations]
                        .sort(
                          (a, b) =>
                            new Date(
                              b.date_reservation || b.date_evenement || 0,
                            ) -
                            new Date(
                              a.date_reservation || a.date_evenement || 0,
                            ),
                        )
                        .slice(0, 5)
                        .map((reservation) => (
                          <tr key={reservation.id}>
                            <td className="px-3">
                              <div className="fw-semibold">
                                {reservation.utilisateur?.first_name ||
                                  reservation.utilisateur?.username ||
                                  "Client"}
                              </div>
                              <small className="text-muted">
                                {reservation.utilisateur?.email || ""}
                              </small>
                            </td>

                            <td>
                              {reservation.espace_detail?.nom ||
                                reservation.espace?.nom ||
                                "-"}
                            </td>

                            <td>{formatDate(reservation.date_evenement)}</td>
                            <td>{reservation.nombre_personnes || 0}</td>

                            <td className="fw-semibold">
                              {formatAriary(
                                Number(reservation.montant_total || 0),
                              )}
                            </td>

                            <td>
                              <span
                                className={`badge rounded-pill ${getStatutClass(
                                  reservation.statut,
                                )}`}
                              >
                                {getStatutLabel(reservation.statut)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-2 px-3">
              <h5 className="fw-bold mb-0">Résumé</h5>
              <small className="text-muted">État actuel des réservations</small>
            </div>

            <div className="card-body dashboard-summary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-warning-subtle rounded-circle p-2 me-3">
                    <i className="bi bi-clock text-warning-emphasis"></i>
                  </div>
                  <span>En attente</span>
                </div>
                <strong>{reservationsEnAttente}</strong>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary-subtle rounded-circle p-2 me-3">
                    <i className="bi bi-calendar2-check text-primary"></i>
                  </div>
                  <span>Terminées</span>
                </div>
                <strong>{reservationsTerminees}</strong>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Total</span>
                <span className="fw-bold fs-5">{totalReservations}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
