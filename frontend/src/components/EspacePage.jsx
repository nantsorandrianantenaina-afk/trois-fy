import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { espaceService } from "../services/api";

const EspacePage = () => {
  const navigate = useNavigate();
  const [espaces, setEspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("TOUS");
  const [showList, setShowList] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [espaceToDelete, setEspaceToDelete] = useState(null);

  const loadEspaces = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await espaceService.getAll();
      const data = response.data;
      setEspaces(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Votre session a expiré. Veuillez vous reconnecter."
          : "Impossible de charger les espaces.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEspaces();
  }, []);

  const espacesFiltres = useMemo(() => {
    const recherche = search.toLowerCase().trim();

    return espaces.filter((espace) => {
      const correspondRecherche =
        !recherche ||
        espace.nom?.toLowerCase().includes(recherche) ||
        espace.adresse?.toLowerCase().includes(recherche);

      const correspondStatut =
        filter === "TOUS" ||
        (filter === "ACTIFS" && espace.est_actif) ||
        (filter === "INACTIFS" && !espace.est_actif);

      return correspondRecherche && correspondStatut;
    });
  }, [espaces, search, filter]);

  const formatAriary = (montant) =>
    `${new Intl.NumberFormat("fr-FR").format(Number(montant || 0))} Ar`;

  const handleDelete = (espace) => {
    setError("");
    setSuccess("");
    setEspaceToDelete(espace);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingId !== null) return;
    setShowDeleteModal(false);
    setEspaceToDelete(null);
  };

  const confirmDelete = async () => {
    if (!espaceToDelete) return;

    try {
      setDeletingId(espaceToDelete.id);
      setError("");
      setSuccess("");
      await espaceService.delete(espaceToDelete.id);
      setSuccess(`L'espace "${espaceToDelete.nom}" a été supprimé.`);
      setShowDeleteModal(false);
      setEspaceToDelete(null);
      await loadEspaces();
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Votre session a expiré. Veuillez vous reconnecter."
          : err.response?.status === 403
            ? "Vous n'avez pas l'autorisation de supprimer cet espace."
            : "Impossible de supprimer cet espace. Il est peut-être lié à une réservation.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="espace-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div className="d-flex align-items-center">
          <div className="espace-page-icon me-3">
            <i className="bi bi-buildings"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-1">Espaces</h2>
            <p className="text-muted mb-0">Gestion des espaces événementiels</p>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => {
              setShowList((current) => !current);
              setError("");
              setSuccess("");
            }}
          >
            <i
              className={`bi ${showList ? "bi-arrow-left" : "bi-list-ul"} me-2`}
            ></i>
            {showList ? "Retour" : "Liste des espaces"}
          </button>

          <button
            type="button"
            className="btn btn-primary espace-gradient-button"
            onClick={() => navigate("/espaces/nouveau")}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Ajouter un espace
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <span>{error}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setError("")}
            aria-label="Fermer"
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success d-flex align-items-center">
          <span>{success}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setSuccess("")}
            aria-label="Fermer"
          ></button>
        </div>
      )}

      {!showList ? (
        <div className="card border-0 shadow-sm p-4">
          <div className="text-center py-5">
            <div className="espace-page-icon mx-auto mb-3">
              <i className="bi bi-buildings"></i>
            </div>
            <h4 className="fw-bold">Gestion des espaces</h4>
            <p className="text-muted mb-4">
              Consultez la liste des espaces ou ajoutez un nouvel espace
              événementiel.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setShowList(true)}
              >
                <i className="bi bi-list-ul me-2"></i>
                Afficher la liste des espaces
              </button>
              <button
                type="button"
                className="btn btn-primary espace-gradient-button"
                onClick={() => navigate("/espaces/nouveau")}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Ajouter un espace
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="espace-stat-card espace-stat-primary">
                <div>
                  <small>Total espaces</small>
                  <h3>{loading ? "..." : espaces.length}</h3>
                </div>
                <div className="espace-stat-icon">
                  <i className="bi bi-buildings"></i>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="espace-stat-card espace-stat-success">
                <div>
                  <small>Espaces actifs</small>
                  <h3>
                    {loading
                      ? "..."
                      : espaces.filter((e) => e.est_actif).length}
                  </h3>
                </div>
                <div className="espace-stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="espace-stat-card espace-stat-secondary">
                <div>
                  <small>Espaces inactifs</small>
                  <h3>
                    {loading
                      ? "..."
                      : espaces.filter((e) => !e.est_actif).length}
                  </h3>
                </div>
                <div className="espace-stat-icon">
                  <i className="bi bi-pause-circle"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3 espace-filter-card">
            <div className="card-body p-3">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-lg-7">
                  <div className="espace-search">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      placeholder="Rechercher par nom ou adresse..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        title="Effacer la recherche"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-12 col-lg-5">
                  <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                    <button
                      type="button"
                      className={`espace-filter-button ${filter === "TOUS" ? "active" : ""}`}
                      onClick={() => setFilter("TOUS")}
                    >
                      Tous
                    </button>
                    <button
                      type="button"
                      className={`espace-filter-button ${filter === "ACTIFS" ? "active-success" : ""}`}
                      onClick={() => setFilter("ACTIFS")}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Actifs
                    </button>
                    <button
                      type="button"
                      className={`espace-filter-button ${filter === "INACTIFS" ? "active-secondary" : ""}`}
                      onClick={() => setFilter("INACTIFS")}
                    >
                      <i className="bi bi-pause-circle me-1"></i>
                      Inactifs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm espace-list-card">
            <div className="card-header bg-white border-0 px-3 py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <h5 className="fw-bold mb-1">Liste des espaces</h5>
                  <small className="text-muted">
                    {espacesFiltres.length} résultat
                    {espacesFiltres.length !== 1 ? "s" : ""}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-light border"
                  onClick={loadEspaces}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Actualiser
                </button>
              </div>
            </div>

            {loading ? (
              <div className="espace-empty-state">
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                ></div>
                <p className="text-muted mb-0">Chargement des espaces...</p>
              </div>
            ) : espacesFiltres.length === 0 ? (
              <div className="espace-empty-state">
                <h5 className="fw-bold">Aucun espace trouvé</h5>
                <p className="text-muted">
                  Aucun espace ne correspond à votre recherche ou à votre
                  filtre.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table espace-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Espace</th>
                      <th>Capacité</th>
                      <th>Prix / personne</th>
                      <th>Adresse</th>
                      <th>Statut</th>
                      <th className="text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {espacesFiltres.map((espace) => (
                      <tr key={espace.id}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center">
                            <div className="espace-avatar">
                              <i className="bi bi-building"></i>
                            </div>
                            <div>
                              <div className="fw-semibold">{espace.nom}</div>
                              <small className="text-muted">
                                Espace #{espace.id}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span>{espace.capacite_max} personnes</span>
                        </td>
                        <td className="fw-semibold">
                          {formatAriary(espace.prix_par_personne)}
                        </td>
                        <td>{espace.adresse || "-"}</td>
                        <td>
                          <span
                            className={`espace-status ${espace.est_actif ? "active" : "inactive"}`}
                          >
                            <span></span>
                            {espace.est_actif ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="espace-action edit"
                              title="Modifier"
                              onClick={() =>
                                navigate(`/espaces/${espace.id}/modifier`)
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              type="button"
                              className="espace-action delete"
                              title="Supprimer"
                              disabled={deletingId === espace.id}
                              onClick={() => handleDelete(espace)}
                            >
                              <i className="bi bi-trash"></i>
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
        </>
      )}

      {showDeleteModal && espaceToDelete && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
            onClick={closeDeleteModal}
          ></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Supprimer l'espace</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeDeleteModal}
                    aria-label="Fermer"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Voulez-vous vraiment supprimer l'espace{" "}
                    <strong>{espaceToDelete.nom}</strong> ?
                  </p>
                  <p className="text-danger mb-0">
                    Cette action est irréversible.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={closeDeleteModal}
                    disabled={deletingId !== null}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmDelete}
                    disabled={deletingId !== null}
                  >
                    {deletingId !== null ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EspacePage;
