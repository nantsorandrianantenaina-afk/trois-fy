import React, { useCallback, useEffect, useMemo, useState } from "react";
import { reservationService, typeEvenementService } from "../services/api";
import "./RapportsPage.css";

const COULEURS_TYPES = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#64748b",
];

const getList = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const normaliser = (valeur) =>
  String(valeur ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

const obtenirStatut = (reservation) => normaliser(reservation?.statut);

const obtenirDate = (reservation) =>
  reservation?.date_evenement || reservation?.dateEvenement || "";

const obtenirNomType = (reservation, types) => {
  const typeId =
    reservation?.type_evenement?.id ??
    reservation?.type_evenement ??
    reservation?.type_evenement_id ??
    reservation?.typeEvenement?.id;

  const typeAssocie = types.find((type) => String(type.id) === String(typeId));

  return (
    reservation?.type_evenement_detail?.libelle ||
    reservation?.type_evenement_detail?.nom ||
    reservation?.typeEvenement?.libelle ||
    reservation?.type_evenement_libelle ||
    (typeof reservation?.type_evenement === "object"
      ? reservation.type_evenement?.libelle || reservation.type_evenement?.nom
      : "") ||
    typeAssocie?.libelle ||
    typeAssocie?.nom ||
    (typeId ? `Type ${typeId}` : "Non précisé")
  );
};

const creerDateLocale = (date) => {
  const maintenant = date || new Date();

  return [
    maintenant.getFullYear(),
    String(maintenant.getMonth() + 1).padStart(2, "0"),
    String(maintenant.getDate()).padStart(2, "0"),
  ].join("-");
};

const obtenirDebutSemaine = (date) => {
  const debut = new Date(date);
  const jour = debut.getDay();

  debut.setDate(debut.getDate() - (jour === 0 ? 6 : jour - 1));

  return creerDateLocale(debut);
};

const RapportsPage = () => {
  const maintenant = new Date();
  const dateAujourdhui = creerDateLocale(maintenant);
  const premierJourMois = `${maintenant.getFullYear()}-${String(
    maintenant.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const [reservations, setReservations] = useState([]);
  const [types, setTypes] = useState([]);
  const [periode, setPeriode] = useState("mois");
  const [dateDebut, setDateDebut] = useState(premierJourMois);
  const [dateFin, setDateFin] = useState(dateAujourdhui);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const chargerDonnees = useCallback(async () => {
    setChargement(true);
    setErreur("");

    try {
      const [reservationsResponse, typesResponse] = await Promise.all([
        reservationService.getAll(),
        typeEvenementService.getAll(),
      ]);

      setReservations(getList(reservationsResponse));
      setTypes(getList(typesResponse));
    } catch (error) {
      console.error("Erreur de chargement des rapports :", error);
      setErreur(
        "Impossible de charger les graphiques. Vérifiez la connexion au serveur.",
      );
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  const choisirPeriode = (valeur) => {
    const maintenantLocal = new Date();
    const fin = creerDateLocale(maintenantLocal);

    setPeriode(valeur);

    if (valeur === "semaine") {
      setDateDebut(obtenirDebutSemaine(maintenantLocal));
      setDateFin(fin);
    } else if (valeur === "mois") {
      setDateDebut(
        `${maintenantLocal.getFullYear()}-${String(
          maintenantLocal.getMonth() + 1,
        ).padStart(2, "0")}-01`,
      );
      setDateFin(fin);
    } else if (valeur === "annee") {
      setDateDebut(`${maintenantLocal.getFullYear()}-01-01`);
      setDateFin(fin);
    } else if (valeur === "tout") {
      setDateDebut("");
      setDateFin("");
    }
  };

  const reservationsPeriode = useMemo(() => {
    return reservations.filter((reservation) => {
      const date = obtenirDate(reservation);

      if (!date) return false;
      if (dateDebut && date < dateDebut) return false;
      if (dateFin && date > dateFin) return false;

      return true;
    });
  }, [reservations, dateDebut, dateFin]);

  const statistiquesStatuts = useMemo(() => {
    const resultat = {
      enAttente: 0,
      terminees: 0,
      autres: 0,
    };

    reservationsPeriode.forEach((reservation) => {
      const statut = obtenirStatut(reservation);

      if (statut === "EN_ATTENTE") {
        resultat.enAttente += 1;
      } else if (statut === "TERMINEE" || statut === "TERMINEES") {
        resultat.terminees += 1;
      } else {
        resultat.autres += 1;
      }
    });

    return resultat;
  }, [reservationsPeriode]);

  const totalStatuts =
    statistiquesStatuts.enAttente +
    statistiquesStatuts.terminees +
    statistiquesStatuts.autres;

  const donutStatuts = useMemo(() => {
    if (totalStatuts === 0) {
      return "conic-gradient(#e5e7eb 0% 100%)";
    }

    const attente = (statistiquesStatuts.enAttente / totalStatuts) * 100;
    const terminees = (statistiquesStatuts.terminees / totalStatuts) * 100;
    const finTerminees = attente + terminees;

    return `conic-gradient(
      #f59e0b 0% ${attente}%,
      #2563eb ${attente}% ${finTerminees}%,
      #94a3b8 ${finTerminees}% 100%
    )`;
  }, [statistiquesStatuts, totalStatuts]);

  const reservationsParType = useMemo(() => {
    const groupes = new Map();

    reservationsPeriode.forEach((reservation) => {
      const nom = obtenirNomType(reservation, types);
      groupes.set(nom, (groupes.get(nom) || 0) + 1);
    });

    return Array.from(groupes.entries())
      .map(([nom, total]) => ({ nom, total }))
      .sort((a, b) => b.total - a.total);
  }, [reservationsPeriode, types]);

  const totalTypes = reservationsParType.reduce(
    (total, element) => total + element.total,
    0,
  );

  const donutTypes = useMemo(() => {
    if (totalTypes === 0) {
      return "conic-gradient(#e5e7eb 0% 100%)";
    }

    let cumul = 0;

    const segments = reservationsParType.map((element, index) => {
      const debut = cumul;
      cumul += (element.total / totalTypes) * 100;

      return `${COULEURS_TYPES[index % COULEURS_TYPES.length]} ${debut}% ${cumul}%`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [reservationsParType, totalTypes]);

  const exporterPDF = () => {
    window.print();
  };

  return (
    <main className="rapports-page">
      <header className="rapports-header">
        <div className="rapports-titre-bloc">
          <p className="rapports-surtitle">ANALYSE DE L’ACTIVITÉ</p>
          <h1>Rapports et statistiques</h1>
          <p className="rapports-description">
            Visualisez la répartition des réservations et des événements.
          </p>
        </div>

        <div className="rapports-actions no-print">
          <button
            type="button"
            className="rapports-btn rapports-btn-secondary"
            onClick={chargerDonnees}
            disabled={chargement}
          >
            ↻ Actualiser
          </button>

          <button
            type="button"
            className="rapports-btn rapports-btn-primary"
            onClick={exporterPDF}
          >
            ↓ Exporter PDF
          </button>
        </div>
      </header>

      <section className="rapports-filtres no-print">
        <div className="rapports-periodes">
          {[
            ["semaine", "Cette semaine"],
            ["mois", "Ce mois"],
            ["annee", "Cette année"],
            ["tout", "Toute la période"],
          ].map(([valeur, libelle]) => (
            <button
              key={valeur}
              type="button"
              className={`rapports-periode-btn ${
                periode === valeur ? "active" : ""
              }`}
              onClick={() => choisirPeriode(valeur)}
            >
              {libelle}
            </button>
          ))}
        </div>

        <div className="rapports-dates">
          <label>
            Du
            <input
              type="date"
              value={dateDebut}
              onChange={(event) => {
                setDateDebut(event.target.value);
                setPeriode("personnalisee");
              }}
            />
          </label>

          <label>
            Au
            <input
              type="date"
              value={dateFin}
              onChange={(event) => {
                setDateFin(event.target.value);
                setPeriode("personnalisee");
              }}
            />
          </label>
        </div>
      </section>

      {erreur && (
        <div className="rapports-erreur" role="alert">
          <span>{erreur}</span>
          <button type="button" onClick={chargerDonnees}>
            Réessayer
          </button>
        </div>
      )}

      {chargement ? (
        <div className="rapports-message">
          <span className="rapports-spinner" />
          Chargement des graphiques…
        </div>
      ) : (
        <>
          <div className="rapports-resume">
            <span className="rapports-resume-point" />
            <span>
              {reservationsPeriode.length} réservation
              {reservationsPeriode.length > 1 ? "s" : ""} sur la période
              sélectionnée
            </span>
          </div>

          <section className="rapports-grille">
            <article className="rapports-carte rapports-carte-statut">
              <div className="rapports-carte-entete">
                <div>
                  <h2>Statut des réservations</h2>
                  <p>Répartition selon le statut</p>
                </div>
                <span className="rapports-icone">◔</span>
              </div>

              <div className="rapports-donut-conteneur">
                <div
                  className="rapports-donut rapports-donut-statut"
                  style={{ background: donutStatuts }}
                  role="img"
                  aria-label="Diagramme circulaire des statuts des réservations"
                >
                  <div className="rapports-donut-centre">
                    <strong>{totalStatuts}</strong>
                    <span>Réservations</span>
                  </div>
                </div>

                <div className="rapports-legende">
                  <div className="rapports-legende-ligne">
                    <span className="rapports-pastille attente" />
                    <span>En attente</span>
                    <strong>{statistiquesStatuts.enAttente}</strong>
                  </div>

                  <div className="rapports-legende-ligne">
                    <span className="rapports-pastille terminee" />
                    <span>Terminées</span>
                    <strong>{statistiquesStatuts.terminees}</strong>
                  </div>

                  <div className="rapports-legende-ligne">
                    <span className="rapports-pastille autres" />
                    <span>Autres statuts</span>
                    <strong>{statistiquesStatuts.autres}</strong>
                  </div>
                </div>
              </div>
            </article>

            <article className="rapports-carte rapports-carte-types">
              <div className="rapports-carte-entete">
                <div>
                  <h2>Types d’événements</h2>
                  <p>Répartition des événements réservés</p>
                </div>
                <span className="rapports-icone rapports-icone-vert">◉</span>
              </div>

              <div className="rapports-donut-conteneur rapports-types-conteneur">
                <div
                  className="rapports-donut rapports-donut-types"
                  style={{ background: donutTypes }}
                  role="img"
                  aria-label="Diagramme circulaire des types d’événements"
                >
                  <div className="rapports-donut-centre">
                    <strong>{totalTypes}</strong>
                    <span>Événements</span>
                  </div>
                </div>

                <div className="rapports-legende rapports-legende-types">
                  {reservationsParType.length === 0 ? (
                    <p className="rapports-vide-compact">
                      Aucun type d’événement à afficher.
                    </p>
                  ) : (
                    reservationsParType.map((element, index) => (
                      <div className="rapports-legende-ligne" key={element.nom}>
                        <span
                          className="rapports-pastille"
                          style={{
                            backgroundColor:
                              COULEURS_TYPES[index % COULEURS_TYPES.length],
                          }}
                        />
                        <span className="rapports-legende-nom">
                          {element.nom}
                        </span>
                        <strong>{element.total}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </article>
          </section>

          <p className="rapports-note">
            Les graphiques sont calculés selon la date de l’événement et les
            réservations enregistrées.
          </p>
        </>
      )}
    </main>
  );
};

export default RapportsPage;
