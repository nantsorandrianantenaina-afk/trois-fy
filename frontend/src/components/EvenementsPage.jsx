import React, { useEffect, useMemo, useState } from "react";
import {
  reservationService,
  espaceService,
  typeEvenementService,
} from "../services/api";
import "./EvenementsPage.css";

const EvenementsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [espaces, setEspaces] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("TOUS");
  const [dateFiltre, setDateFiltre] = useState("");

  const getList = (response) => {
    const data = response?.data ?? response;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [r, e, t] = await Promise.all([
        reservationService.getAll(),
        espaceService.getAll(),
        typeEvenementService.getAll(),
      ]);

      setReservations(getList(r));
      setEspaces(getList(e));
      setTypes(getList(t));
    } catch (err) {
      const data = err?.response?.data;

      setError(
        data?.detail ||
          (typeof data === "object" && data
            ? Object.entries(data)
                .map(([key, value]) => {
                  const message = Array.isArray(value)
                    ? value.join(" ")
                    : String(value);
                  return `${key} : ${message}`;
                })
                .join(" ")
            : typeof data === "string"
              ? data
              : "Impossible de charger les événements. Vérifiez le serveur Django et les autorisations."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEspace = (r) => {
    const detail = r.espace_detail || r.espace;

    if (detail && typeof detail === "object") {
      return detail.nom || detail.libelle || "Espace";
    }

    return (
      espaces.find((e) => String(e.id) === String(detail))?.nom ||
      r.espace_nom ||
      "Espace"
    );
  };

  const getType = (r) => {
    const detail = r.type_evenement_detail || r.type_evenement;

    if (detail && typeof detail === "object") {
      return detail.libelle || detail.nom || "Événement";
    }

    return (
      types.find((t) => String(t.id) === String(detail))?.libelle ||
      r.type_evenement_libelle ||
      "Événement"
    );
  };

  const getClient = (r) => {
    const client = r.utilisateur_detail || r.utilisateur;

    if (client && typeof client === "object") {
      return (
        `${client.first_name || ""} ${client.last_name || ""}`.trim() ||
        client.username ||
        client.email ||
        "Client"
      );
    }

    return "Client";
  };

  const formatDate = (value) => {
    if (!value) return "—";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${value}T00:00:00`));
  };

  const formatMontant = (value) =>
    `${new Intl.NumberFormat("fr-FR").format(Number(value || 0))} Ar`;

  const formatHeure = (value) => (value ? String(value).slice(0, 5) : "—");

  const getStatut = (value) => {
    const labels = {
      EN_ATTENTE: "En attente",
      CONFIRMEE: "Confirmée",
      CONFIRMÉE: "Confirmée",
      ANNULEE: "Annulée",
      ANNULÉE: "Annulée",
      TERMINEE: "Terminée",
      TERMINÉE: "Terminée",
    };

    return labels[value] || value || "Inconnu";
  };

  const getStatutClass = (value) => {
    if (["CONFIRMEE", "CONFIRMÉE"].includes(value)) return "confirmee";
    if (["ANNULEE", "ANNULÉE"].includes(value)) return "annulee";
    if (["TERMINEE", "TERMINÉE"].includes(value)) return "terminee";
    if (value === "EN_ATTENTE") return "attente";
    return "inconnu";
  };

  const evenementsFiltres = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reservations.filter((r) => {
      const rechercheTexte = [
        getClient(r),
        getEspace(r),
        getType(r),
        String(r.id || ""),
      ]
        .join(" ")
        .toLowerCase();

      const correspondRecherche = !term || rechercheTexte.includes(term);

      const correspondStatut =
        statut === "TOUS" ||
        r.statut === statut ||
        (statut === "CONFIRMEE" && r.statut === "CONFIRMÉE") ||
        (statut === "ANNULEE" && r.statut === "ANNULÉE") ||
        (statut === "TERMINEE" && r.statut === "TERMINÉE");

      const correspondDate = !dateFiltre || r.date_evenement === dateFiltre;

      return correspondRecherche && correspondStatut && correspondDate;
    });
  }, [reservations, espaces, types, search, statut, dateFiltre]);

  const nombreConfirmes = reservations.filter((r) =>
    ["CONFIRMEE", "CONFIRMÉE"].includes(r.statut),
  ).length;

  const nombreEnAttente = reservations.filter(
    (r) => r.statut === "EN_ATTENTE",
  ).length;

  const nombreAnnules = reservations.filter((r) =>
    ["ANNULEE", "ANNULÉE"].includes(r.statut),
  ).length;

  return (
    <div className="evenements-page">
      <div className="evenements-header">
        <div className="evenements-heading">
          <div className="evenements-heading-icon">
            <i className="bi bi-calendar-event"></i>
          </div>
          <div>
            <h2>Événements</h2>
            <p>Gestion des événements réservés dans les espaces</p>
          </div>
        </div>

        <button
          type="button"
          className="evenements-refresh"
          onClick={loadData}
          disabled={loading}
        >
          <i
            className={`bi ${loading ? "bi-arrow-repeat" : "bi-arrow-clockwise"}`}
          ></i>
          Actualiser
        </button>
      </div>

      {error && (
        <div className="evenements-alert">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      <div className="evenements-stats">
        <div className="evenements-stat-card">
          <div>
            <span>Total des événements</span>
            <strong>{loading ? "…" : reservations.length}</strong>
          </div>
          <div className="evenements-stat-icon violet">
            <i className="bi bi-calendar3"></i>
          </div>
        </div>

        <div className="evenements-stat-card">
          <div>
            <span>Confirmés</span>
            <strong>{loading ? "…" : nombreConfirmes}</strong>
          </div>
          <div className="evenements-stat-icon vert">
            <i className="bi bi-check-circle"></i>
          </div>
        </div>

        <div className="evenements-stat-card">
          <div>
            <span>En attente</span>
            <strong>{loading ? "…" : nombreEnAttente}</strong>
          </div>
          <div className="evenements-stat-icon orange">
            <i className="bi bi-hourglass-split"></i>
          </div>
        </div>

        <div className="evenements-stat-card">
          <div>
            <span>Annulés</span>
            <strong>{loading ? "…" : nombreAnnules}</strong>
          </div>
          <div className="evenements-stat-icon rouge">
            <i className="bi bi-x-circle"></i>
          </div>
        </div>
      </div>

      <div className="evenements-filtres">
        <div className="evenements-search">
          <i className="bi bi-search"></i>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client, un espace ou un événement..."
          />
        </div>

        <div className="evenements-filter-group">
          <label htmlFor="evenement-statut">Statut</label>
          <select
            id="evenement-statut"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmés</option>
            <option value="ANNULEE">Annulés</option>
            <option value="TERMINEE">Terminés</option>
          </select>
        </div>

        <div className="evenements-filter-group">
          <label htmlFor="evenement-date">Date</label>
          <input
            id="evenement-date"
            type="date"
            value={dateFiltre}
            onChange={(e) => setDateFiltre(e.target.value)}
          />
        </div>

        {(search || dateFiltre || statut !== "TOUS") && (
          <button
            type="button"
            className="evenements-reset"
            onClick={() => {
              setSearch("");
              setDateFiltre("");
              setStatut("TOUS");
            }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="evenements-table-card">
        <div className="evenements-table-header">
          <div>
            <h3>Liste des événements</h3>
            <p>
              {evenementsFiltres.length} résultat
              {evenementsFiltres.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="evenements-message">
            <span className="spinner-border text-primary"></span>
            <p>Chargement des événements...</p>
          </div>
        ) : evenementsFiltres.length === 0 ? (
          <div className="evenements-message">
            <i className="bi bi-calendar-x"></i>
            <h4>Aucun événement trouvé</h4>
            <p>
              Les événements enregistrés dans les réservations apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="evenements-table-scroll">
            <table className="evenements-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Événement</th>
                  <th>Client</th>
                  <th>Espace</th>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Personnes</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                {evenementsFiltres.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="evenements-reference">#{r.id}</span>
                    </td>
                    <td>
                      <div className="evenements-event-name">
                        <span className="evenements-event-icon">
                          <i className="bi bi-calendar2-event"></i>
                        </span>
                        <strong>{getType(r)}</strong>
                      </div>
                    </td>
                    <td>{getClient(r)}</td>
                    <td>
                      <span className="evenements-space-name">
                        <i className="bi bi-building"></i>
                        {getEspace(r)}
                      </span>
                    </td>
                    <td>{formatDate(r.date_evenement)}</td>
                    <td>
                      {formatHeure(r.heure_debut)} – {formatHeure(r.heure_fin)}
                    </td>
                    <td>{r.nombre_personnes ?? "—"}</td>
                    <td className="evenements-amount">
                      {formatMontant(r.montant_total)}
                    </td>
                    <td>
                      <span
                        className={`evenements-status ${getStatutClass(r.statut)}`}
                      >
                        {getStatut(r.statut)}
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
  );
};

export default EvenementsPage;
