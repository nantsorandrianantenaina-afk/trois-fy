import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paiementService, reservationService } from "../services/api";
import "./PaiementPage.css";

const NUMERO_MVOLA = "038 10 548 22";

export default function PaiementPage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [mode, setMode] = useState("MOBILE_MONEY");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    let actif = true;

    reservationService
      .getById(reservationId)
      .then(({ data }) => {
        if (actif) setReservation(data);
      })
      .catch((error) => {
        if (actif) {
          setErreur(
            error.response?.data?.detail ||
              "Impossible de charger cette réservation.",
          );
        }
      })
      .finally(() => {
        if (actif) setLoading(false);
      });

    return () => {
      actif = false;
    };
  }, [reservationId]);

  const copierNumero = async () => {
    try {
      await navigator.clipboard.writeText(NUMERO_MVOLA);
      setErreur("");
    } catch {
      setErreur("Copie impossible. Recopiez le numéro affiché.");
    }
  };

  const creerPaiement = async (event) => {
    event.preventDefault();

    if (!reservation || sending) return;

    if (mode === "MOBILE_MONEY" && !reference.trim()) {
      setErreur("Saisissez la référence de transaction MVola.");
      return;
    }

    setSending(true);
    setErreur("");

    try {
      await paiementService.create({
        reservation: reservation.id,
        montant: reservation.montant_total,
        mode_paiement: mode,
        reference:
          mode === "MOBILE_MONEY"
            ? reference.trim()
            : `ESP-${reservation.id}-${Date.now()}`,
      });

      setSucces(true);
    } catch (error) {
      const data = error.response?.data;

      setErreur(
        typeof data === "string"
          ? data
          : data?.detail ||
              data?.reference?.[0] ||
              data?.non_field_errors?.[0] ||
              data?.montant?.[0] ||
              data?.reservation?.[0] ||
              data?.mode_paiement?.[0] ||
              "Impossible d'enregistrer le paiement. Vérifiez les informations.",
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="paiement-page">Chargement de la réservation...</div>;
  }

  if (!reservation) {
    return (
      <main className="paiement-page">
        <p className="paiement-erreur">
          {erreur || "Réservation introuvable."}
        </p>
        <button
          type="button"
          className="paiement-btn secondaire"
          onClick={() => navigate("/reservations")}
        >
          Retour aux réservations
        </button>
      </main>
    );
  }

  return (
    <main className="paiement-page">
      <button
        type="button"
        className="paiement-retour"
        onClick={() => navigate("/reservations")}
      >
        ← Retour aux réservations
      </button>

      <section className="paiement-card">
        <div className="paiement-entete">
          <span className="paiement-icone">
            <i className="bi bi-credit-card"></i>
          </span>
          <div>
            <h1>Paiement de réservation</h1>
            <p>Réservation #{reservation.id}</p>
          </div>
        </div>

        <div className="paiement-montant">
          <span>Montant à régler</span>
          <strong>
            {Number(reservation.montant_total).toLocaleString("fr-FR")} Ar
          </strong>
          <span>
            {reservation.espace_detail?.nom ||
              reservation.espace?.nom ||
              "Espace réservé"}
          </span>
        </div>

        {succes ? (
          <div className="paiement-attente">
            <h2>Demande de paiement enregistrée</h2>
            <p>
              Ton paiement est enregistré. Il doit être vérifié avant la
              confirmation de la réservation.
            </p>
            {mode === "MOBILE_MONEY" && (
              <p>
                Numéro MVola destinataire : <strong>{NUMERO_MVOLA}</strong>
              </p>
            )}
            <button
              type="button"
              className="paiement-btn"
              onClick={() => navigate("/paiements")}
            >
              Consulter les paiements
            </button>
          </div>
        ) : (
          <form onSubmit={creerPaiement}>
            <h2>Choisissez votre mode de paiement</h2>

            <label
              className={`paiement-option ${
                mode === "ESPECES" ? "selectionne" : ""
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="ESPECES"
                checked={mode === "ESPECES"}
                onChange={() => setMode("ESPECES")}
              />
              <span>
                <strong>Paiement en espèces</strong>
                <small>Règlement auprès de l'administrateur.</small>
              </span>
            </label>

            <label
              className={`paiement-option ${
                mode === "MOBILE_MONEY" ? "selectionne" : ""
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="MOBILE_MONEY"
                checked={mode === "MOBILE_MONEY"}
                onChange={() => setMode("MOBILE_MONEY")}
              />
              <span>
                <strong>MVola</strong>
                <small>Transfert mobile vers le numéro indiqué.</small>
              </span>
            </label>

            {mode === "MOBILE_MONEY" && (
              <div className="paiement-mvola">
                <span>Numéro MVola destinataire</span>
                <strong>{NUMERO_MVOLA}</strong>

                <button
                  type="button"
                  className="paiement-btn secondaire"
                  onClick={copierNumero}
                >
                  Copier le numéro
                </button>

                <label htmlFor="reference">
                  Référence de transaction MVola
                </label>
                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Référence après le transfert"
                  maxLength={100}
                  required
                />
                <small>
                  La référence doit correspondre à un transfert réellement
                  effectué. Elle ne prouve pas à elle seule la réception du
                  paiement.
                </small>
              </div>
            )}

            {erreur && <p className="paiement-erreur">{erreur}</p>}

            <button className="paiement-btn" type="submit" disabled={sending}>
              {sending ? "Enregistrement..." : "Enregistrer le paiement"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
