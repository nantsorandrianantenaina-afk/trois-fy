
import React, { useEffect, useState } from "react";
import { paiementService } from "../services/api";

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let actif = true;

    paiementService
      .getAll()
      .then(({ data }) => {
        if (!actif) return;

        const liste = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setPaiements(liste);
      })
      .catch((error) => {
        if (!actif) return;

        setErreur(
          error.response?.data?.detail ||
            "Impossible de charger les paiements."
        );
      })
      .finally(() => {
        if (actif) setLoading(false);
      });

    return () => {
      actif = false;
    };
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Gestion des paiements</h2>
        <p className="text-muted">
          Consultez les paiements liés aux réservations.
        </p>
      </div>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Liste des paiements</h5>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <p className="text-center py-5 mb-0">
              Chargement des paiements...
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-3">N°</th>
                    <th>Réservation</th>
                    <th>Montant</th>
                    <th>Mode</th>
                    <th>Statut</th>
                    <th>Référence</th>
                  </tr>
                </thead>

                <tbody>
                  {paiements.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        Aucun paiement enregistré.
                      </td>
                    </tr>
                  ) : (
                    paiements.map((paiement) => (
                      <tr key={paiement.id}>
                        <td className="px-3">#{paiement.id}</td>
                        <td>
                          {typeof paiement.reservation === "object"
                            ? paiement.reservation?.id ?? "—"
                            : paiement.reservation ?? "—"}
                        </td>
                        <td>
                          {paiement.montant != null
                            ? `${Number(paiement.montant).toLocaleString("fr-FR")} Ar`
                            : "—"}
                        </td>
                        <td>{paiement.mode_paiement ?? "—"}</td>
                        <td>
                          {paiement.statut_paiement ??
                            paiement.statut ??
                            "Non renseigné"}
                        </td>
                        <td>{paiement.reference || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
