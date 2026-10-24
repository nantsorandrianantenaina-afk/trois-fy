import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clientService } from "../services/api";

const formulaireInitial = {
  first_name: "",
  last_name: "",
  telephone: "",
  email: "",
  adresse: "",
};

export default function ClientsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formulaire, setFormulaire] = useState(formulaireInitial);
  const [clientEnEdition, setClientEnEdition] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const client = location.state?.clientAEditer;

    if (client) {
      setClientEnEdition(client);
      setFormulaire({
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        telephone: client.telephone || "",
        email: client.email || "",
        adresse: client.adresse || "",
      });

      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const modifierChamp = (event) => {
    const { name, value } = event.target;
    setFormulaire((ancien) => ({ ...ancien, [name]: value }));
  };

  const reinitialiser = () => {
    setFormulaire(formulaireInitial);
    setClientEnEdition(null);
    setErreur("");
  };

  const enregistrerClient = async (event) => {
    event.preventDefault();
    setErreur("");

    const donnees = {
      first_name: formulaire.first_name.trim(),
      last_name: formulaire.last_name.trim(),
      telephone: formulaire.telephone.trim(),
      email: formulaire.email.trim() || null,
      adresse: formulaire.adresse.trim(),
    };

    if (!donnees.first_name || !donnees.last_name || !donnees.telephone) {
      setErreur("Le prénom, le nom et le téléphone sont obligatoires.");
      return;
    }

    setEnregistrement(true);

    try {
      if (clientEnEdition) {
        await clientService.update(clientEnEdition.id, donnees);
      } else {
        await clientService.create(donnees);
      }

      navigate("/clients/liste", {
        state: {
          message: clientEnEdition
            ? "Les informations du client ont été modifiées."
            : "Le client a été ajouté avec succès.",
        },
      });
    } catch (error) {
      const data = error.response?.data;

      if (data && typeof data === "object") {
        setErreur(
          Object.entries(data)
            .map(
              ([champ, valeur]) =>
                `${champ} : ${
                  Array.isArray(valeur) ? valeur.join(" ") : String(valeur)
                }`,
            )
            .join(" | "),
        );
      } else {
        setErreur("Impossible d'enregistrer le client. Vérifiez le serveur.");
      }
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-2">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div className="text-primary fw-semibold small mb-1">
            ESPACES TROIS FY / CLIENTS
          </div>
          <h3 className="fw-bold mb-0" style={{ fontSize: "1.45rem" }}>
            {clientEnEdition ? "Modifier un client" : "Nouveau client"}
          </h3>
          <small className="text-secondary">
            Renseignez les coordonnées du client.
          </small>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm px-3 py-2 flex-shrink-0"
          onClick={() => navigate("/clients/liste")}
        >
          <i className="bi bi-people me-2"></i>
          Liste des clients
        </button>
      </div>

      {erreur && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {erreur}
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-12 col-xxl-10">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    background: "#eaf2ff",
                    color: "#2459a9",
                    fontSize: 21,
                  }}
                >
                  <i
                    className={`bi ${
                      clientEnEdition ? "bi-person-gear" : "bi-person-plus"
                    }`}
                  ></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-1" style={{ fontSize: "1.05rem" }}>
                    Informations du client
                  </h5>
                  <small className="text-secondary">
                    Les champs avec * sont obligatoires.
                  </small>
                </div>
              </div>

              <form onSubmit={enregistrerClient}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="first_name"
                      className="form-label fw-semibold mb-1"
                    >
                      Prénom <span className="text-danger">*</span>
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      className="form-control"
                      placeholder="Prénom du client"
                      value={formulaire.first_name}
                      onChange={modifierChamp}
                      maxLength={150}
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="last_name"
                      className="form-label fw-semibold mb-1"
                    >
                      Nom <span className="text-danger">*</span>
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      className="form-control"
                      placeholder="Nom du client"
                      value={formulaire.last_name}
                      onChange={modifierChamp}
                      maxLength={150}
                      autoComplete="family-name"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="telephone"
                      className="form-label fw-semibold mb-1"
                    >
                      Téléphone <span className="text-danger">*</span>
                    </label>
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      className="form-control"
                      placeholder="Ex. : 034 00 000 00"
                      value={formulaire.telephone}
                      onChange={modifierChamp}
                      maxLength={30}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold mb-1"
                    >
                      Adresse e-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="client@exemple.com"
                      value={formulaire.email}
                      onChange={modifierChamp}
                      maxLength={254}
                      autoComplete="email"
                    />
                  </div>

                  <div className="col-12">
                    <label
                      htmlFor="adresse"
                      className="form-label fw-semibold mb-1"
                    >
                      Adresse
                    </label>
                    <textarea
                      id="adresse"
                      name="adresse"
                      className="form-control"
                      placeholder="Adresse du client (facultatif)"
                      rows={2}
                      maxLength={255}
                      value={formulaire.adresse}
                      onChange={modifierChamp}
                      autoComplete="street-address"
                      style={{ resize: "none" }}
                    />
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-end gap-2 mt-3 pt-3 border-top">
                  {clientEnEdition && (
                    <button
                      type="button"
                      className="btn btn-light border btn-sm px-3"
                      onClick={() => navigate("/clients/liste")}
                      disabled={enregistrement}
                    >
                      Annuler
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={reinitialiser}
                    disabled={enregistrement}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                    Réinitialiser
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4"
                    disabled={enregistrement}
                  >
                    {enregistrement ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2"></i>
                        {clientEnEdition
                          ? "Enregistrer les modifications"
                          : "Ajouter le client"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
