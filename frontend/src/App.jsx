import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";

import EspacePage from "./components/EspacePage";
import EspaceForm from "./components/EspaceForm";
import EspaceEdit from "./components/EspaceEdit";
import PaiementPage from "./components/PaiementPage";
import PaiementsPage from "./pages/PaiementsPage";
import ClientsPage from "./pages/ClientsPage";
import ListeClientsPage from "./pages/ListeClientsPage";
import ReservationPage from "./components/ReservationPage";
import EvenementsPage from "./components/EvenementsPage";
import RapportsPage from "./components/RapportsPage";
import AboutPage from "./pages/AboutPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AboutPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/reservations" element={<ReservationPage />} />

          <Route path="/espaces" element={<EspacePage />} />

          <Route path="/espaces/nouveau" element={<EspaceForm />} />

          <Route path="/espaces/:id/modifier" element={<EspaceEdit />} />

          <Route path="/clients" element={<ClientsPage />} />

          <Route path="/clients/liste" element={<ListeClientsPage />} />

          <Route path="/evenements" element={<EvenementsPage />} />

          <Route path="/paiements" element={<PaiementsPage />} />

          <Route path="/paiement/:reservationId" element={<PaiementPage />} />

          <Route path="/rapports" element={<RapportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
