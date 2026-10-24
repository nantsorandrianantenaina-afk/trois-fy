import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  reservationService,
  espaceService,
  typeEvenementService,
  clientService,
} from "../services/api";
import "./ReservationPage.css";

const ReservationPage = () => {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [espaces, setEspaces] = useState([]);
  const [typesEvenements, setTypesEvenements] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showReservationList, setShowReservationList] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);

  const [form, setForm] = useState({
    utilisateur: "",
    espace: "",
    type_evenement: "",
    date_evenement: "",
    heure_debut: "",
    heure_fin: "",
    nombre_personnes: "",
  });

  const getToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const formatAriary = (montant) =>
    `${new Intl.NumberFormat("fr-FR").format(Number(montant || 0))} Ar`;

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (value) => (value ? String(value).slice(0, 5) : "-");

  const isCancelled = (statut) =>
    ["ANNULEE", "ANNULÉE"].includes(String(statut || "").toUpperCase());

  const isCompleted = (statut) =>
    ["TERMINEE", "TERMINÉE"].includes(String(statut || "").toUpperCase());

  const isPending = (statut) =>
    String(statut || "").toUpperCase() === "EN_ATTENTE";

  const getStatusClass = (statut) => {
    if (isCancelled(statut)) return "reservation-status cancelled";
    if (isPending(statut)) return "reservation-status pending";
    if (isCompleted(statut)) return "reservation-status completed";
    if (
      ["CONFIRMEE", "CONFIRMÉE"].includes(String(statut || "").toUpperCase())
    ) {
      return "reservation-status confirmed";
    }
    return "reservation-status default";
  };

  const getStatusLabel = (statut) => {
    if (isCancelled(statut)) return "Annulée";
    if (isPending(statut)) return "En attente";
    if (isCompleted(statut)) return "Terminée";
    if (
      ["CONFIRMEE", "CONFIRMÉE"].includes(String(statut || "").toUpperCase())
    ) {
      return "Confirmée";
    }
    return statut || "Inconnu";
  };

  const getClientName = (reservation) => {
    const user = reservation?.utilisateur_detail ?? reservation?.utilisateur;
    if (!user) return "Client";

    if (typeof user !== "object") {
      const client = clients.find((item) => String(item.id) === String(user));
      return client
        ? `${client.first_name || ""} ${client.last_name || ""}`.trim() ||
            client.username ||
            client.email ||
            "Client"
        : "Client";
    }

    return (
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.username ||
      user.email ||
      "Client"
    );
  };

  const getEspaceName = (reservation) =>
    reservation?.espace_detail?.nom ||
    reservation?.espace?.nom ||
    reservation?.espace_nom ||
    espaces.find(
      (item) =>
        String(item.id) ===
        String(
          typeof reservation?.espace === "object"
            ? reservation.espace?.id
            : reservation?.espace,
        ),
    )?.nom ||
    "-";

  const getTypeEvenementName = (reservation) =>
    reservation?.type_evenement_detail?.libelle ||
    reservation?.type_evenement?.libelle ||
    reservation?.type_evenement_libelle ||
    typesEvenements.find(
      (item) =>
        String(item.id) ===
        String(
          typeof reservation?.type_evenement === "object"
            ? reservation.type_evenement?.id
            : reservation?.type_evenement,
        ),
    )?.libelle ||
    "-";

  const extractApiError = (err) => {
    const data = err?.response?.data;
    if (!data) {
      return (
        err?.message ||
        "Une erreur est survenue. Vérifiez la connexion au serveur."
      );
    }
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    return (
      Object.entries(data)
        .map(([key, value]) => {
          const message = Array.isArray(value)
            ? value.join(" ")
            : typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value);
          return `${key} : ${message}`;
        })
        .join(" ") || "Impossible d'effectuer cette opération."
    );
  };

  const getList = (response) => {
    const data = response?.data ?? response;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const [r, e, t, c] = await Promise.all([
        reservationService.getAll(),
        espaceService.getAll(),
        typeEvenementService.getAll(),
        clientService.getAll(),
      ]);

      setReservations(getList(r));
      setEspaces(getList(e));
      setTypesEvenements(getList(t));
      setClients(getList(c));
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const intervalId = window.setInterval(() => loadData(false), 60000);
    return () => window.clearInterval(intervalId);
  }, [loadData]);

  const totalReservations = reservations.length;
  const reservationsEnAttente = reservations.filter((r) =>
    isPending(r.statut),
  ).length;
  const reservationsTerminees = reservations.filter((r) =>
    isCompleted(r.statut),
  ).length;

  const resetForm = () => {
    setForm({
      utilisateur: "",
      espace: "",
      type_evenement: "",
      date_evenement: "",
      heure_debut: "",
      heure_fin: "",
      nombre_personnes: "",
    });
    setEditingReservation(null);
  };

  const openCreateForm = async () => {
    setError("");
    setSuccess("");
    resetForm();
    setShowForm(true);

    if (!clients.length || !espaces.length || !typesEvenements.length) {
      await loadData(false);
    }
  };

  const openEditForm = (reservation) => {
    if (isCancelled(reservation.statut) || isCompleted(reservation.statut)) {
      setError(
        "Une réservation annulée ou terminée ne peut pas être modifiée.",
      );
      return;
    }

    setError("");
    setSuccess("");
    setEditingReservation(reservation);

    const utilisateur =
      reservation.utilisateur_detail?.id ??
      (typeof reservation.utilisateur === "object"
        ? reservation.utilisateur?.id
        : reservation.utilisateur) ??
      "";

    setForm({
      utilisateur: utilisateur === null ? "" : String(utilisateur),
      espace:
        typeof reservation.espace === "object"
          ? String(reservation.espace?.id || "")
          : String(reservation.espace || reservation.espace_detail?.id || ""),
      type_evenement:
        typeof reservation.type_evenement === "object"
          ? String(reservation.type_evenement?.id || "")
          : String(
              reservation.type_evenement ||
                reservation.type_evenement_detail?.id ||
                "",
            ),
      date_evenement: reservation.date_evenement || "",
      heure_debut:
        formatTime(reservation.heure_debut) === "-"
          ? ""
          : formatTime(reservation.heure_debut),
      heure_fin:
        formatTime(reservation.heure_fin) === "-"
          ? ""
          : formatTime(reservation.heure_fin),
      nombre_personnes: String(reservation.nombre_personnes || ""),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (loadingForm) return;
    setShowForm(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const espaceSelectionne = espaces.find(
    (e) => String(e.id) === String(form.espace),
  );
  const typeEvenementSelectionne = typesEvenements.find(
    (t) => String(t.id) === String(form.type_evenement),
  );
  const nombrePersonnes = Number(form.nombre_personnes || 0);
  const prixParPersonne = Number(espaceSelectionne?.prix_par_personne ?? 4000);
  const supplementEvenement = Number(typeEvenementSelectionne?.supplement || 0);
  const supplementHoraire =
    form.heure_fin && Number(form.heure_fin.slice(0, 2)) > 18 ? 20000 : 0;
  const montantPrevisionnel =
    prixParPersonne * nombrePersonnes + supplementEvenement + supplementHoraire;

  const validateForm = () => {
    if (!form.utilisateur) return "Veuillez sélectionner un client.";
    if (!clients.some((c) => String(c.id) === String(form.utilisateur))) {
      return "Le client sélectionné est introuvable. Actualisez la liste des clients.";
    }
    if (!form.espace) return "Veuillez sélectionner un espace.";
    if (!form.type_evenement)
      return "Veuillez sélectionner le type d'événement.";
    if (!form.date_evenement)
      return "Veuillez sélectionner la date de l'événement.";
    if (form.date_evenement < getToday())
      return "La date ne peut pas être dans le passé.";
    if (!form.heure_debut || !form.heure_fin)
      return "Veuillez renseigner les heures de début et de fin.";
    if (form.heure_fin <= form.heure_debut)
      return "L'heure de fin doit être après l'heure de début.";
    if (form.heure_debut < "07:30" || form.heure_fin < "07:30") {
      return "Les heures ne peuvent pas être avant 07:30.";
    }
    if (!nombrePersonnes || nombrePersonnes < 1) {
      return "Le nombre de personnes doit être supérieur ou égal à 1.";
    }
    if (
      espaceSelectionne &&
      nombrePersonnes > Number(espaceSelectionne.capacite_max)
    ) {
      return `La capacité maximale est de ${espaceSelectionne.capacite_max} personnes.`;
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loadingForm) return;

    setError("");
    setSuccess("");
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoadingForm(true);

      const payload = {
        utilisateur: Number(form.utilisateur),
        espace: Number(form.espace),
        type_evenement: Number(form.type_evenement),
        date_evenement: form.date_evenement,
        heure_debut: form.heure_debut,
        heure_fin: form.heure_fin,
        nombre_personnes: nombrePersonnes,
      };

      if (editingReservation) {
        await reservationService.update(editingReservation.id, payload);
        setShowForm(false);
        resetForm();
        setSuccess("La réservation a été modifiée avec succès.");
        await loadData(false);
        return;
      }

      const response = await reservationService.create(payload);
      const responseData = response?.data ?? response;
      const reservation =
        responseData?.reservation ?? responseData?.data ?? responseData;

      if (reservation?.id === undefined || reservation?.id === null) {
        await loadData(false);
        throw new Error(
          "La réponse du serveur ne contient pas l'identifiant de la réservation.",
        );
      }

      setShowForm(false);
      resetForm();

      navigate(`/paiement/${reservation.id}`, {
        state: {
          reservation,
          montant: reservation.montant_total ?? montantPrevisionnel,
        },
      });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoadingForm(false);
    }
  };

  const askDelete = (reservation) => {
    setError("");
    setSuccess("");
    setReservationToDelete(reservation);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    if (loadingForm) return;
    setShowDeleteModal(false);
    setReservationToDelete(null);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete || loadingForm) return;

    try {
      setLoadingForm(true);
      setError("");
      setSuccess("");

      await reservationService.delete(reservationToDelete.id);

      setReservations((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(reservationToDelete.id),
        ),
      );

      setShowDeleteModal(false);
      setReservationToDelete(null);
      setSuccess("La réservation a été supprimée avec succès.");
      await loadData(false);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="reservation-page">
      <div className="reservation-header">
        <div className="reservation-title-wrapper">
          <div className="reservation-page-icon">
            <i className="bi bi-calendar2-check"></i>
          </div>
          <div>
            <h2>
              {showReservationList ? "Liste des réservations" : "Réservations"}
            </h2>
            <p>
              {showReservationList
                ? "Consultez toutes les réservations enregistrées"
                : "Gestion des réservations des espaces événementiels"}
            </p>
          </div>
        </div>

        <div className="reservation-header-actions">
          {showReservationList ? (
            <button
              type="button"
              className="reservation-secondary-button"
              onClick={() => {
                setShowReservationList(false);
                setError("");
                setSuccess("");
              }}
            >
              <i className="bi bi-arrow-left"></i> Retour
            </button>
          ) : (
            <button
              type="button"
              className="reservation-secondary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowReservationList(true);
              }}
            >
              <i className="bi bi-list-ul"></i> Liste des réservations
            </button>
          )}

          <button
            type="button"
            className="reservation-primary-button"
            onClick={openCreateForm}
          >
            <i className="bi bi-plus-lg"></i> Nouvelle réservation
          </button>
        </div>
      </div>

      {error && (
        <div className="reservation-alert reservation-alert-danger">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {success && (
        <div className="reservation-alert reservation-alert-success">
          <i className="bi bi-check-circle-fill"></i>
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {!showReservationList && (
        <div className="reservation-stats">
          {[
            [
              "Total réservations",
              totalReservations,
              "bi-calendar3",
              "primary",
            ],
            [
              "En attente",
              reservationsEnAttente,
              "bi-hourglass-split",
              "warning",
            ],
            ["Terminées", reservationsTerminees, "bi-check-circle", "success"],
          ].map(([label, value, icon, color]) => (
            <div className="reservation-stat-card" key={label}>
              <div>
                <span>{label}</span>
                <strong>{loading ? "..." : value}</strong>
              </div>
              <div className={`reservation-stat-icon ${color}`}>
                <i className={`bi ${icon}`}></i>
              </div>
            </div>
          ))}
        </div>
      )}

      {showReservationList && (
        <div className="reservation-list-card">
          <div className="reservation-list-header">
            <div>
              <h5>Liste complète des réservations</h5>
              <span>
                {reservations.length} réservation
                {reservations.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              type="button"
              className="reservation-refresh-button"
              onClick={() => loadData()}
              disabled={loading}
            >
              <i
                className={`bi ${loading ? "bi-arrow-repeat" : "bi-arrow-clockwise"}`}
              ></i>{" "}
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="reservation-empty">
              <div className="spinner-border text-primary mb-3"></div>
              <p>Chargement des réservations...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="reservation-empty">
              <div className="reservation-empty-icon">
                <i className="bi bi-calendar-x"></i>
              </div>
              <h5>Aucune réservation enregistrée</h5>
              <p>Les réservations créées apparaîtront dans ce tableau.</p>
              <button
                type="button"
                className="reservation-primary-button"
                onClick={openCreateForm}
              >
                <i className="bi bi-plus-lg"></i> Nouvelle réservation
              </button>
            </div>
          ) : (
            <div className="reservation-table-wrapper">
              <table className="reservation-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Espace</th>
                    <th>Événement</th>
                    <th>Date</th>
                    <th>Horaire</th>
                    <th>Personnes</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>
                        <div className="reservation-client">
                          <div className="reservation-avatar">
                            <i className="bi bi-person"></i>
                          </div>
                          <div>
                            <strong>{getClientName(reservation)}</strong>
                            <small>Réservation #{reservation.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="reservation-space">
                          <i className="bi bi-building"></i>{" "}
                          {getEspaceName(reservation)}
                        </span>
                      </td>
                      <td>{getTypeEvenementName(reservation)}</td>
                      <td>
                        <span className="reservation-date">
                          <i className="bi bi-calendar-event"></i>{" "}
                          {formatDate(reservation.date_evenement)}
                        </span>
                      </td>
                      <td>
                        <span className="reservation-time">
                          {formatTime(reservation.heure_debut)} -{" "}
                          {formatTime(reservation.heure_fin)}
                        </span>
                      </td>
                      <td>
                        <span className="reservation-people">
                          <i className="bi bi-people"></i>{" "}
                          {reservation.nombre_personnes}
                        </span>
                      </td>
                      <td>
                        <strong className="reservation-amount">
                          {formatAriary(reservation.montant_total)}
                        </strong>
                      </td>
                      <td>
                        <span className={getStatusClass(reservation.statut)}>
                          <span></span>
                          {getStatusLabel(reservation.statut)}
                        </span>
                      </td>
                      <td>
                        <div className="reservation-actions">
                          {!isCancelled(reservation.statut) &&
                            !isCompleted(reservation.statut) && (
                              <button
                                type="button"
                                className="reservation-action edit"
                                title="Modifier"
                                onClick={() => openEditForm(reservation)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            )}
                          <button
                            type="button"
                            className="reservation-action delete"
                            title="Supprimer"
                            onClick={() => askDelete(reservation)}
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
      )}

      {showForm && (
        <div
          className="reservation-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loadingForm)
              closeForm();
          }}
        >
          <div className="reservation-modal">
            <div className="reservation-modal-header">
              <div>
                <div className="reservation-modal-icon">
                  <i
                    className={`bi ${editingReservation ? "bi-pencil-square" : "bi-calendar-plus"}`}
                  ></i>
                </div>
                <div>
                  <h4>
                    {editingReservation
                      ? "Modifier la réservation"
                      : "Nouvelle réservation"}
                  </h4>
                  <p>Renseignez les informations de l'événement.</p>
                </div>
              </div>
              <button
                type="button"
                className="reservation-modal-close"
                onClick={closeForm}
                disabled={loadingForm}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="reservation-form">
              <div className="reservation-form-grid">
                <div className="reservation-field">
                  <label htmlFor="utilisateur">
                    Client <span>*</span>
                  </label>
                  <select
                    id="utilisateur"
                    name="utilisateur"
                    value={form.utilisateur}
                    onChange={handleChange}
                    disabled={loadingForm}
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {`${client.first_name || ""} ${client.last_name || ""}`.trim() ||
                          client.username ||
                          client.email ||
                          `Client #${client.id}`}
                      </option>
                    ))}
                  </select>
                  {clients.length === 0 && (
                    <small>
                      Aucun client disponible. Enregistrez d'abord un client
                      dans la page Clients.
                    </small>
                  )}
                </div>

                <div className="reservation-field">
                  <label htmlFor="espace">
                    Espace <span>*</span>
                  </label>
                  <select
                    id="espace"
                    name="espace"
                    value={form.espace}
                    onChange={handleChange}
                    disabled={loadingForm}
                    required
                  >
                    <option value="">Sélectionner un espace</option>
                    {espaces
                      .filter((e) => e.est_actif)
                      .map((espace) => (
                        <option key={espace.id} value={espace.id}>
                          {espace.nom} — {espace.capacite_max} places
                        </option>
                      ))}
                  </select>
                </div>

                <div className="reservation-field">
                  <label htmlFor="type_evenement">
                    Type d'événement <span>*</span>
                  </label>
                  <select
                    id="type_evenement"
                    name="type_evenement"
                    value={form.type_evenement}
                    onChange={handleChange}
                    disabled={loadingForm}
                    required
                  >
                    <option value="">Sélectionner un événement</option>
                    {typesEvenements.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.libelle}
                        {type.supplement
                          ? ` — +${formatAriary(type.supplement)}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="reservation-field">
                  <label htmlFor="date_evenement">
                    Date de l'événement <span>*</span>
                  </label>
                  <input
                    id="date_evenement"
                    name="date_evenement"
                    type="date"
                    min={getToday()}
                    value={form.date_evenement}
                    onChange={handleChange}
                    disabled={loadingForm}
                    required
                  />
                  <small>
                    La date de création est enregistrée automatiquement.
                  </small>
                </div>

                <div className="reservation-field">
                  <label htmlFor="nombre_personnes">
                    Nombre de personnes <span>*</span>
                  </label>
                  <input
                    id="nombre_personnes"
                    name="nombre_personnes"
                    type="number"
                    min="1"
                    max={espaceSelectionne?.capacite_max || undefined}
                    value={form.nombre_personnes}
                    onChange={handleChange}
                    disabled={loadingForm}
                    placeholder="Ex. 100"
                    required
                  />
                  {espaceSelectionne?.capacite_max && (
                    <small>
                      Capacité maximale : {espaceSelectionne.capacite_max}{" "}
                      personnes.
                    </small>
                  )}
                </div>

                <div className="reservation-field">
                  <label htmlFor="heure_debut">
                    Heure de début <span>*</span>
                  </label>
                  <input
                    id="heure_debut"
                    name="heure_debut"
                    type="time"
                    min="07:30"
                    value={form.heure_debut}
                    onChange={handleChange}
                    disabled={loadingForm}
                    required
                  />
                </div>

                <div className="reservation-field">
                  <label htmlFor="heure_fin">
                    Heure de fin <span>*</span>
                  </label>
                  <input
                    id="heure_fin"
                    name="heure_fin"
                    type="time"
                    min="07:30"
                    value={form.heure_fin}
                    onChange={handleChange}
                    disabled={loadingForm}
                    required
                  />
                </div>
              </div>

              <div className="reservation-price-preview">
                <div className="reservation-price-icon">
                  <i className="bi bi-calculator"></i>
                </div>
                <div className="reservation-price-content">
                  <span>Montant prévisionnel</span>
                  <strong>{formatAriary(montantPrevisionnel)}</strong>
                  <small>
                    Prix de base : {formatAriary(prixParPersonne)} / personne
                    {supplementEvenement > 0 &&
                      ` • Supplément événement : ${formatAriary(supplementEvenement)}`}
                    {supplementHoraire > 0 &&
                      ` • Supplément horaire : ${formatAriary(supplementHoraire)}`}
                  </small>
                </div>
              </div>

              <div className="reservation-form-note">
                <i className="bi bi-info-circle"></i>
                <span>
                  Le montant définitif est calculé et contrôlé par le serveur.
                </span>
              </div>

              <div className="reservation-modal-footer">
                <button
                  type="button"
                  className="reservation-cancel-button"
                  onClick={closeForm}
                  disabled={loadingForm}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="reservation-submit-button"
                  disabled={loadingForm || clients.length === 0}
                >
                  {loadingForm ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>{" "}
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>{" "}
                      {editingReservation
                        ? "Enregistrer les modifications"
                        : "Créer la réservation"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && reservationToDelete && (
        <div className="reservation-modal-overlay">
          <div className="reservation-delete-modal">
            <div className="reservation-delete-icon">
              <i className="bi bi-trash3"></i>
            </div>
            <h4>Supprimer la réservation ?</h4>
            <p>
              Vous êtes sur le point de supprimer la réservation #
              {reservationToDelete.id}.
            </p>
            <div className="reservation-delete-info">
              <strong>{getClientName(reservationToDelete)}</strong>
              <span>
                {getEspaceName(reservationToDelete)} •{" "}
                {formatDate(reservationToDelete.date_evenement)}
              </span>
            </div>
            <div className="reservation-delete-warning">
              <i className="bi bi-exclamation-triangle"></i>
              <span>Cette action est irréversible.</span>
            </div>
            <div className="reservation-delete-actions">
              <button
                type="button"
                className="reservation-cancel-button"
                onClick={cancelDelete}
                disabled={loadingForm}
              >
                Retour
              </button>
              <button
                type="button"
                className="reservation-delete-confirm"
                onClick={confirmDelete}
                disabled={loadingForm}
              >
                {loadingForm ? (
                  "Suppression..."
                ) : (
                  <>
                    <i className="bi bi-trash3"></i> Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
