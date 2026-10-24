import React from "react";
import { useNavigate } from "react-router-dom";
import "./AboutPage.css";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="about-brand">
          <div className="about-brand-icon">
            <i className="bi bi-building"></i>
          </div>
          <div>
            <strong>ESPACES TROIS FY</strong>
            <span>Gestion des espaces événementiels</span>
          </div>
        </div>

        <button
          type="button"
          className="about-login-button"
          onClick={() => navigate("/login")}
        >
          <i className="bi bi-box-arrow-in-right me-2"></i>
          Se connecter
        </button>
      </header>

      <main>
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-eyebrow">PROJET INFORMATIQUE</span>
            <h1>À propos du projet</h1>
            <p>
              Une application de gestion permettant d'organiser les espaces, les
              clients, les réservations, les événements et les paiements depuis
              une interface d'administration.
            </p>
            <button
              type="button"
              className="about-primary-button"
              onClick={() => navigate("/login")}
            >
              Accéder à l'administration
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>

          <div className="about-hero-illustration" aria-hidden="true">
            <div className="about-illustration-circle">
              <i className="bi bi-calendar2-check"></i>
            </div>
            <div className="about-floating-card about-floating-one">
              <i className="bi bi-building"></i>
              <span>Espaces</span>
            </div>
            <div className="about-floating-card about-floating-two">
              <i className="bi bi-calendar-check"></i>
              <span>Réservations</span>
            </div>
            <div className="about-floating-card about-floating-three">
              <i className="bi bi-credit-card"></i>
              <span>Paiements</span>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-eyebrow">PRÉSENTATION</span>
            <h2>Informations sur l'étudiant</h2>
          </div>

          <div className="about-info-grid">
            <article className="about-info-card about-student-card">
              <div className="about-card-icon">
                <i className="bi bi-mortarboard"></i>
              </div>
              <span className="about-card-label">Étudiant</span>
              <h3>RANDRIANANTENAINA Miantso Liantsoa</h3>
              <div className="about-info-line">
                <i className="bi bi-person-badge"></i>
                <span>
                  Matricule : <strong>3374/24</strong>
                </span>
              </div>
              <div className="about-info-line">
                <i className="bi bi-laptop"></i>
                <span>Parcours : Informatique</span>
              </div>
            </article>

            <article className="about-info-card">
              <div className="about-card-icon purple">
                <i className="bi bi-folder2-open"></i>
              </div>
              <span className="about-card-label">Projet réalisé</span>
              <h3>Gestion de réservation d'espaces événementiels</h3>
              <p>
                Application destinée à l'administration et au suivi des
                opérations de location d'espaces pour différents événements.
              </p>
            </article>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-eyebrow">ACCÈS À L'APPLICATION</span>
            <h2>Compte de démonstration</h2>
            <p>Informations de connexion pour la présentation du projet.</p>
          </div>

          <div className="about-credentials">
            <div className="about-credentials-icon">
              <i className="bi bi-shield-lock"></i>
            </div>
            <div className="about-credential-field">
              <span>Adresse e-mail</span>
              <strong>miantso@gmail.com</strong>
            </div>
            <div className="about-credential-field">
              <span>Mot de passe</span>
              <strong>Miantso123?</strong>
            </div>
            <button
              type="button"
              className="about-secondary-button"
              onClick={() => navigate("/login")}
            >
              Ouvrir la connexion
            </button>
          </div>
          <p className="about-security-note">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Ces identifiants sont visibles par tous les visiteurs de cette page.
            Pour un déploiement réel, ne publie jamais le mot de passe d'un
            compte administrateur.
          </p>
        </section>

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-eyebrow">CONCEPTION TECHNIQUE</span>
            <h2>MPD — Modèle physique de données</h2>
            <p>
              Représentation des principales tables de la base de données
              <strong> reservation_espace_db</strong> et de leurs relations.
            </p>
          </div>

          <div className="about-mpd-card">
            <div className="about-mpd-title">
              <div>
                <i className="bi bi-diagram-3 me-2"></i>
                Schéma de la base de données
              </div>
              <span>MariaDB</span>
            </div>

            <div className="about-mpd-scroll">
              <svg
                className="about-mpd-svg"
                viewBox="0 0 1000 650"
                role="img"
                aria-label="MPD présentant les tables utilisateurs, espaces, types_evenements, reservations et paiements, ainsi que leurs relations."
              >
                <defs>
                  <marker
                    id="mpd-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#718096" />
                  </marker>
                </defs>

                <g
                  fill="none"
                  stroke="#718096"
                  strokeWidth="2"
                  markerEnd="url(#mpd-arrow)"
                >
                  <path d="M260 150 H330 V280 H380" />
                  <path d="M740 150 H680 V280 H620" />
                  <path d="M500 170 V230" />
                  <path d="M500 390 V455" />
                </g>

                <g fontFamily="Arial, sans-serif" fontSize="12" fill="#526174">
                  <text x="274" y="139">
                    1 — N
                  </text>
                  <text x="684" y="139">
                    1 — N
                  </text>
                  <text x="510" y="215">
                    1 — N
                  </text>
                  <text x="510" y="445">
                    1 — 1
                  </text>
                </g>

                <g transform="translate(30 45)">
                  <rect
                    width="230"
                    height="135"
                    rx="10"
                    fill="#fff"
                    stroke="#4f7cff"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 0 H220 Q230 0 230 10 V38 H0 V10 Q0 0 10 0"
                    fill="#4f7cff"
                  />
                  <text
                    x="115"
                    y="25"
                    fill="#fff"
                    fontWeight="bold"
                    fontSize="15"
                    textAnchor="middle"
                  >
                    utilisateurs
                  </text>
                  <g fill="#253348" fontSize="12">
                    <text x="14" y="60">
                      🔑 id (PK)
                    </text>
                    <text x="14" y="80">
                      email (unique)
                    </text>
                    <text x="14" y="100">
                      username
                    </text>
                    <text x="14" y="120">
                      role
                    </text>
                  </g>
                </g>

                <g transform="translate(740 45)">
                  <rect
                    width="230"
                    height="135"
                    rx="10"
                    fill="#fff"
                    stroke="#4f7cff"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 0 H220 Q230 0 230 10 V38 H0 V10 Q0 0 10 0"
                    fill="#4f7cff"
                  />
                  <text
                    x="115"
                    y="25"
                    fill="#fff"
                    fontWeight="bold"
                    fontSize="15"
                    textAnchor="middle"
                  >
                    espaces
                  </text>
                  <g fill="#253348" fontSize="12">
                    <text x="14" y="60">
                      🔑 id (PK)
                    </text>
                    <text x="14" y="80">
                      nom
                    </text>
                    <text x="14" y="100">
                      capacite_max
                    </text>
                    <text x="14" y="120">
                      est_actif
                    </text>
                  </g>
                </g>

                <g transform="translate(380 45)">
                  <rect
                    width="240"
                    height="125"
                    rx="10"
                    fill="#fff"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 0 H230 Q240 0 240 10 V38 H0 V10 Q0 0 10 0"
                    fill="#8b5cf6"
                  />
                  <text
                    x="120"
                    y="25"
                    fill="#fff"
                    fontWeight="bold"
                    fontSize="15"
                    textAnchor="middle"
                  >
                    types_evenements
                  </text>
                  <g fill="#253348" fontSize="12">
                    <text x="14" y="60">
                      🔑 id (PK)
                    </text>
                    <text x="14" y="80">
                      libelle
                    </text>
                    <text x="14" y="100">
                      supplement
                    </text>
                  </g>
                </g>

                <g transform="translate(330 230)">
                  <rect
                    width="340"
                    height="170"
                    rx="10"
                    fill="#fff"
                    stroke="#0d9488"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 0 H330 Q340 0 340 10 V38 H0 V10 Q0 0 10 0"
                    fill="#0d9488"
                  />
                  <text
                    x="170"
                    y="25"
                    fill="#fff"
                    fontWeight="bold"
                    fontSize="15"
                    textAnchor="middle"
                  >
                    reservations
                  </text>
                  <g fill="#253348" fontSize="12">
                    <text x="16" y="60">
                      🔑 id (PK)
                    </text>
                    <text x="16" y="80">
                      utilisateur_id (FK)
                    </text>
                    <text x="16" y="100">
                      espace_id (FK)
                    </text>
                    <text x="16" y="120">
                      type_evenement_id (FK)
                    </text>
                    <text x="16" y="140">
                      date_evenement, horaires
                    </text>
                    <text x="16" y="158">
                      nombre_personnes, montant_total, statut
                    </text>
                  </g>
                </g>

                <g transform="translate(380 455)">
                  <rect
                    width="240"
                    height="150"
                    rx="10"
                    fill="#fff"
                    stroke="#ea8a24"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 0 H230 Q240 0 240 10 V38 H0 V10 Q0 0 10 0"
                    fill="#ea8a24"
                  />
                  <text
                    x="120"
                    y="25"
                    fill="#fff"
                    fontWeight="bold"
                    fontSize="15"
                    textAnchor="middle"
                  >
                    paiements
                  </text>
                  <g fill="#253348" fontSize="12">
                    <text x="14" y="60">
                      🔑 id (PK)
                    </text>
                    <text x="14" y="80">
                      reservation_id (FK unique)
                    </text>
                    <text x="14" y="100">
                      mode_paiement
                    </text>
                    <text x="14" y="120">
                      statut
                    </text>
                    <text x="14" y="140">
                      reference
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            <div className="about-mpd-legend">
              <span>
                <b>PK</b> : clé primaire
              </span>
              <span>
                <b>FK</b> : clé étrangère
              </span>
              <span>1 — N : une relation un-à-plusieurs</span>
              <span>1 — 1 : une relation un-à-un</span>
            </div>
            <p className="about-mpd-warning">
              Schéma de présentation basé sur les modèles principaux du projet.
              Les noms exacts des champs et les clés doivent être vérifiés avec
              les modèles Django et les migrations de la base de données.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-eyebrow">CE QUE FAIT L'APPLICATION</span>
            <h2>Fonctionnalités principales</h2>
          </div>

          <div className="about-feature-grid">
            <article className="about-feature-card">
              <i className="bi bi-shield-check"></i>
              <h3>Authentification</h3>
              <p>
                Connexion administrateur et accès protégé aux pages de gestion.
              </p>
            </article>
            <article className="about-feature-card">
              <i className="bi bi-people"></i>
              <h3>Gestion des clients</h3>
              <p>
                Enregistrement et consultation des clients qui louent les
                espaces.
              </p>
            </article>
            <article className="about-feature-card">
              <i className="bi bi-calendar2-check"></i>
              <h3>Réservations</h3>
              <p>
                Organisation des dates, horaires, espaces et types d'événements.
              </p>
            </article>
            <article className="about-feature-card">
              <i className="bi bi-credit-card"></i>
              <h3>Paiements</h3>
              <p>Suivi des paiements et de leur statut.</p>
            </article>
            <article className="about-feature-card">
              <i className="bi bi-bar-chart"></i>
              <h3>Rapports</h3>
              <p>
                Visualisation des statistiques des réservations et des
                événements.
              </p>
            </article>
            <article className="about-feature-card">
              <i className="bi bi-building"></i>
              <h3>Gestion des espaces</h3>
              <p>
                Gestion des espaces disponibles et de leur capacité d'accueil.
              </p>
            </article>
          </div>
        </section>

        <section className="about-section about-tech-section">
          <div className="about-section-heading">
            <span className="about-eyebrow">OUTILS DE DÉVELOPPEMENT</span>
            <h2>Technologies utilisées</h2>
          </div>

          <div className="about-tech-list">
            {[
              "Python",
              "Django",
              "Django REST Framework",
              "React JS",
              "Vite",
              "JavaScript",
              "HTML5",
              "CSS3",
              "MariaDB",
              "Axios",
              "JWT",
            ].map((tech) => (
              <span className="about-tech-badge" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer className="about-footer">
        <div>
          <strong>ESPACES TROIS FY</strong>
          <span>
            Application de gestion de réservation d'espaces événementiels
          </span>
        </div>
        <span>Projet informatique · 2026</span>
      </footer>
    </div>
  );
};

export default AboutPage;
