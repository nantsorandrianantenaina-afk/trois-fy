import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import "../../index.css";

const AppLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Tableau de bord",
      icon: "bi-speedometer2",
      path: "/dashboard",
    },
    {
      label: "Réservations",
      icon: "bi-calendar-check",
      path: "/reservations",
    },
    {
      label: "Espaces",
      icon: "bi-building",
      path: "/espaces",
    },
    {
      label: "Clients",
      icon: "bi-people",
      path: "/clients",
    },
    {
      label: "Événements",
      icon: "bi-calendar-event",
      path: "/evenements",
    },
    {
      label: "Paiements",
      icon: "bi-credit-card",
      path: "/paiements",
    },
    {
      label: "Rapports",
      icon: "bi-bar-chart",
      path: "/rapports",
    },
  ];

  return (
    <div className="d-flex app-container bg-light">
      {/* SIDEBAR */}
      <aside className="app-sidebar bg-dark text-white d-flex flex-column">
        {/* Logo */}
        <div className="px-3 py-3 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <i className="bi bi-building fs-3 me-2"></i>

            <div>
              <h6 className="mb-0 fw-bold">ESPACES TROIS FY</h6>

              <small className="text-secondary">Gestion des réservations</small>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="sidebar-nav flex-grow-1 px-2 py-3">
          <div className="text-uppercase text-secondary small fw-bold mb-2 px-2">
            Menu principal
          </div>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `d-flex align-items-center text-decoration-none rounded px-3 py-2 mb-1 ${
                  isActive ? "bg-primary text-white" : "text-light"
                }`
              }
            >
              <i className={`bi ${item.icon} me-3`}></i>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-3 border-top border-secondary">
          <button
            type="button"
            className="btn btn-outline-light w-100"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left me-2"></i>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ZONE PRINCIPALE */}
      <div className="app-main flex-grow-1 d-flex flex-column">
        {/* HEADER */}
        <header className="app-header bg-white border-bottom shadow-sm">
          <div className="h-100 d-flex justify-content-between align-items-center px-4">
            <div>
              <h5 className="mb-0 fw-bold">
                Gestion des espaces événementiels
              </h5>

              <small className="text-muted">Administration</small>
            </div>

            <div className="d-flex align-items-center">
              <div className="text-end me-3">
                <div className="fw-semibold">Administrateur</div>

                <small className="text-muted">Gestionnaire</small>
              </div>

              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
