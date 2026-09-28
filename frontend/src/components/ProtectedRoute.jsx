import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Loading…</div>;
  }
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== "Admin") return <Navigate to="/workspace" replace />;

  return children;
}
