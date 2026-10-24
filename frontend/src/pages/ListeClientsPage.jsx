import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clientService } from "../services/api";

function extraireClients(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function ListeClientsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [clients, setClients] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(location.state?.message || "");

  const chargerClients = useCallback(async () => {
    setChargement(true);
    setErreur("");

    try {
      const response = await clientService.getAll();
      setClients(extraireClients(response.data));
    } catch (error) {
      setErreur(
        error.response?.data?.detail ||
          "Impossible de charger les clients. Vérifiez votre connexion.",
      );
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerClients();
  }, [chargerClients]);

  const supprimerClient = async (client) => {
    const nom = `${client.first_name || ""} ${client.last_name || ""}`.trim();

    if (!window.confirm(`Voulez-vous vraiment supprimer le client ${nom} ?`)) {
      return;
    }

    setErreur("");
    setSucces("");

    try {
      await clientService.delete(client.id);
      setSucces(`Le client ${nom} a été supprimé.`);
      await chargerClients();
    } catch (error) {
      setErreur(
        error.response?.data?.detail ||
          "Impossible de supprimer ce client. Il est peut-être lié à une réservation.",
      );
    }
  };

  const clientsFiltres = clients.filter((client) => {
    const texte = [
      client.first_name,
      client.last_name,
      client.telephone,
      client.email,
      client.adresse,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return texte.includes(recherche.trim().toLowerCase());
  });

  return (
    <div className="container-fluid px-3 px-lg-4 py-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div className="text-primary fw-semibold small mb-1">
            ESPACES TROIS FY / CLIENTS
          </div>
          <h3 className="fw-bold mb-0" style={{ fontSize: "1.4rem" }}>
            Liste des clients
          </h3>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm px-3 py-2"
          onClick={() => navigate("/clients")}
        >
          <i className="bi bi-person-plus me-2"></i>
          Retour au formulaire
        </button>
      </div>

      {erreur && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {erreur}
        </div>
      )}

      {succes && (
        <div className="alert alert-success py-2 mb-3" role="status">
          <i className="bi bi-check-circle me-2"></i>
          {succes}
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: "#eaf2ff",
                  color: "#2459a9",
                  fontSize: 20,
                }}
              >
                <i className="bi bi-people"></i>
              </div>
              <div>
                <div className="text-secondary small">Total des clients</div>
                <h4 className="fw-bold mb-0">{clients.length}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: "#edf8f1",
                  color: "#198754",
                  fontSize: 20,
                }}
              >
                <i className="bi bi-search"></i>
              </div>

              <div className="flex-grow-1">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Rechercher par nom, téléphone, e-mail ou adresse..."
                  aria-label="Rechercher un client"
                  value={recherche}
                  onChange={(event) => setRecherche(event.target.value)}
                />
              </div>

              {recherche && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setRecherche("")}
                  title="Effacer la recherche"
                  aria-label="Effacer la recherche"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-body p-0">
          {chargement ? (
            <div className="text-center py-4">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="text-secondary small mt-2 mb-0">
                Chargement des clients...
              </p>
            </div>
          ) : clientsFiltres.length === 0 ? (
            <div className="text-center py-4 px-3">
              <i
                className="bi bi-person-lines-fill text-secondary"
                style={{ fontSize: "34px" }}
              ></i>
              <h6 className="fw-bold mt-2">
                {recherche
                  ? "Aucun résultat trouvé"
                  : "Aucun client enregistré"}
              </h6>
              <p className="text-secondary small mb-3">
                {recherche
                  ? "Essayez un autre terme de recherche."
                  : "Ajoutez votre premier client pour le voir apparaître ici."}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/clients")}
              >
                <i className="bi bi-person-plus me-2"></i>
                Ajouter un client
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f5f7fb" }}>
                  <tr>
                    <th className="px-3 py-2">Client</th>
                    <th className="py-2">Téléphone</th>
                    <th className="py-2">E-mail</th>
                    <th className="py-2">Adresse</th>
                    <th className="text-center px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsFiltres.map((client) => (
                    <tr key={client.id}>
                      <td className="px-3 py-2">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: 34,
                              height: 34,
                              background: "#eaf2ff",
                              color: "#2459a9",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {(client.first_name || "?").charAt(0).toUpperCase()}
                            {(client.last_name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold">
                              {client.first_name} {client.last_name}
                            </div>
                            <small className="text-secondary">
                              #{client.id}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td className="py-2">
                        <span className="text-nowrap small">
                          {client.telephone || "—"}
                        </span>
                      </td>

                      <td className="py-2">
                        <span className="text-break small">
                          {client.email || "—"}
                        </span>
                      </td>

                      <td className="py-2">
                        <span className="text-secondary small">
                          {client.adresse || "—"}
                        </span>
                      </td>

                      <td className="text-center px-3 py-2">
                        <div className="d-inline-flex flex-wrap justify-content-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Modifier le client"
                            aria-label={`Modifier ${client.first_name} ${client.last_name}`}
                            onClick={() =>
                              navigate("/clients", {
                                state: { clientAEditer: client },
                              })
                            }
                          >
                            <i className="bi bi-pencil-square me-1"></i>
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Supprimer le client"
                            aria-label={`Supprimer ${client.first_name} ${client.last_name}`}
                            onClick={() => supprimerClient(client)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Supprimer
                          </button>
                        </div>
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
  );
}
