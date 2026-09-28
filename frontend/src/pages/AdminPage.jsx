import React, { useState, useEffect } from "react";
import {
  ShieldCheck, Loader2, AlertCircle, Info, Users,
  Activity, Server, Database, Search
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function AdminPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listAllUsers(token)
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredUsers = users.filter(
    (u) => u.email.toLowerCase().includes(search.toLowerCase()) ||
           (u.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="System Administration">
      <div className="jm-info">
        <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: 1, color: "var(--gold)" }} />
        Enterprise administration console. Manage firm user accounts, view active roles, and monitor Gemini LLM infrastructure status.
      </div>

      {error && <div className="jm-error"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}

      {/* Infrastructure Status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="jm-card">
          <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
            <Server size={13} style={{ color: "var(--gold)" }} /> LLM Provider Engine
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="jm-badge jm-badge-gold">Active</span>
            <span className="jm-mono" style={{ fontSize: 13, fontWeight: 700 }}>Google Gemini 1.5 / 3.7</span>
          </div>
        </div>

        <div className="jm-card">
          <div className="jm-card-label" style={{ color: "var(--good)" }}>
            <Database size={13} style={{ color: "var(--good)" }} /> SQLite Database
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="jm-badge jm-badge-good">Healthy</span>
            <span className="jm-mono" style={{ fontSize: 13, fontWeight: 700 }}>WAL Mode Enabled</span>
          </div>
        </div>

        <div className="jm-card">
          <div className="jm-card-label" style={{ color: "var(--blue)" }}>
            <Users size={13} style={{ color: "var(--blue)" }} /> Registered Accounts
          </div>
          <div className="jm-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>
            {users.length} Counsel Accounts
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="jm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <div className="jm-card-label" style={{ margin: 0, color: "var(--gold-light)" }}>Registered Firm Accounts</div>
          <div style={{ position: "relative", width: 230 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
            <input
              style={{
                width: "100%",
                padding: "7px 10px 7px 32px",
                fontSize: 13,
                background: "var(--input-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 6,
                color: "var(--text)",
              }}
              placeholder="Filter counsel members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 30, color: "var(--text-muted)" }}>
            <Loader2 size={18} className="jm-spin" style={{ color: "var(--gold)" }} /> Loading user registry...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "10px 12px" }}>User Name</th>
                  <th style={{ padding: "10px 12px" }}>Email</th>
                  <th style={{ padding: "10px 12px" }}>Role</th>
                  <th style={{ padding: "10px 12px" }}>Member Since</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "12px 12px", fontWeight: 600, color: "var(--text)" }}>{u.full_name || "—"}</td>
                    <td style={{ padding: "12px 12px" }} className="jm-mono">{u.email}</td>
                    <td style={{ padding: "12px 12px" }}>
                      <span className={`jm-badge ${u.role === 'Admin' ? 'jm-badge-gold' : 'jm-badge-blue'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px", color: "var(--text-muted)" }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
