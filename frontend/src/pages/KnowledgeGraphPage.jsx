import React, { useState } from "react";
import {
  Network, Search, Filter, ZoomIn, ZoomOut, RotateCcw,
  Sparkles, Layers, ChevronRight, X
} from "lucide-react";
import Layout from "../components/Layout";

const NODES = [
  { id: "c1", label: "Ferreira v. State", type: "Case", year: 2024, x: 260, y: 180, details: "Key precedent on electronic chain of custody & Section 65B compliance." },
  { id: "c2", label: "Sharad Birdhichand v. State", type: "Case", year: 1984, x: 120, y: 320, details: "Foundational Supreme Court 5 golden principles of circumstantial evidence." },
  { id: "c3", label: "Vanguard Tech Acquisition", type: "Case", year: 2025, x: 620, y: 150, details: "Antitrust horizontal merger dispute under Clayton Act §7." },
  { id: "c4", label: "MedTech v. Biosurge", type: "Case", year: 2024, x: 500, y: 340, details: "Robotic catheter patent infringement and Section 102 prior art." },
  { id: "j1", label: "Justice S. Ravindra Bhat", type: "Judge", court: "Supreme Court", x: 200, y: 70, details: "Authored landmark rulings on electronic privacy, bail & Section 65B." },
  { id: "j2", label: "Judge Leonard P. Stark", type: "Judge", court: "Fed. Circuit", x: 650, y: 310, details: "Presided over complex biotechnology patent claim constructions." },
  { id: "s1", label: "Section 65B Evidence Act", type: "Statute", jurisdiction: "India", x: 380, y: 250, details: "Statutory electronic certificate mandate for admissibility." },
  { id: "s2", label: "Article 21 Constitution", type: "Statute", jurisdiction: "India", x: 90, y: 170, details: "Fundamental right to personal liberty and speedy trial." },
  { id: "s3", label: "Section 7 Clayton Act", type: "Statute", jurisdiction: "USA", x: 740, y: 230, details: "Prohibits mergers that substantially lessen market competition." },
  { id: "s4", label: "35 U.S.C. § 102 Prior Art", type: "Statute", jurisdiction: "USA", x: 440, y: 440, details: "Novelty requirement and anticipatory prior art bars." },
];

const EDGES = [
  { from: "c1", to: "s1", label: "interprets" },
  { from: "c1", to: "s2", label: "invokes" },
  { from: "c1", to: "c2", label: "cites precedent" },
  { from: "j1", to: "c1", label: "authored" },
  { from: "c3", to: "s3", label: "litigated under" },
  { from: "c4", to: "s4", label: "invalidity defense" },
  { from: "j2", to: "c4", label: "presided" },
];

const NODE_TYPES = ["All", "Case", "Judge", "Statute"];

export default function KnowledgeGraphPage() {
  const [selectedNode, setSelectedNode] = useState(NODES[0]);
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [nodePositions, setNodePositions] = useState(
    NODES.reduce((acc, n) => ({ ...acc, [n.id]: { x: n.x, y: n.y } }), {})
  );

  const handleMouseDown = (nodeId) => (e) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNode(NODES.find((n) => n.id === nodeId));
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) / zoom;
    const y = (e.clientY - svgRect.top) / zoom;
    setNodePositions((prev) => ({
      ...prev,
      [draggingNodeId]: { x: Math.max(40, Math.min(860, x)), y: Math.max(40, Math.min(500, y)) },
    }));
  };

  const handleMouseUp = () => setDraggingNodeId(null);

  const filteredNodes = NODES.filter((n) => {
    const matchesType = filterType === "All" || n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Layout title="Legal Precedent Knowledge Graph">
      <div className="jm-info">
        <Network size={15} style={{ flexShrink: 0, marginTop: 1, color: "var(--blue)" }} />
        Interactive topological map of legal precedents, judicial benches, and statutory authorities. Drag nodes or click to inspect interconnected case law.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <div className="jm-card" style={{ padding: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: 600 }}>
          {/* Controls Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {NODE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    background: filterType === t ? "var(--grad-gold)" : "var(--surface)",
                    border: filterType === t ? "1px solid var(--gold)" : "1px solid var(--card-border)",
                    color: filterType === t ? "var(--accent-contrast)" : "var(--text-muted)",
                    borderRadius: 6,
                    padding: "5px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: 9, color: "var(--text-muted)" }} />
                <input
                  style={{
                    padding: "6px 8px 6px 30px",
                    fontSize: 12.5,
                    background: "var(--input-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 6,
                    color: "var(--text)",
                    width: 150,
                  }}
                  placeholder="Filter nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="jm-icon-btn" style={{ width: 32, height: 32 }} onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}>
                <ZoomIn size={14} />
              </button>
              <button className="jm-icon-btn" style={{ width: 32, height: 32 }} onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}>
                <ZoomOut size={14} />
              </button>
              <button className="jm-icon-btn" style={{ width: 32, height: 32 }} onClick={() => { setZoom(1); setNodePositions(NODES.reduce((acc, n) => ({ ...acc, [n.id]: { x: n.x, y: n.y } }), {})); }}>
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div
            style={{
              flex: 1,
              background: "var(--bg-subtle)",
              borderRadius: 10,
              border: "1px solid var(--card-border)",
              position: "relative",
              overflow: "hidden",
              cursor: draggingNodeId ? "grabbing" : "default",
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 900 540"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                transition: draggingNodeId ? "none" : "transform 0.15s ease",
              }}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(212, 175, 55, 0.4)" />
                </marker>
              </defs>

              {/* Draw Edges */}
              {EDGES.map((e, idx) => {
                const p1 = nodePositions[e.from];
                const p2 = nodePositions[e.to];
                if (!p1 || !p2) return null;
                const isConnected = selectedNode && (selectedNode.id === e.from || selectedNode.id === e.to);
                return (
                  <g key={idx}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isConnected ? "var(--gold)" : "rgba(255, 255, 255, 0.12)"}
                      strokeWidth={isConnected ? 2.5 : 1}
                      strokeDasharray={isConnected ? "none" : "4 4"}
                      markerEnd="url(#arrow)"
                    />
                    <text
                      x={(p1.x + p2.x) / 2}
                      y={(p1.y + p2.y) / 2 - 5}
                      fill={isConnected ? "var(--gold-light)" : "var(--text-dim)"}
                      fontSize="10"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {e.label}
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {filteredNodes.map((n) => {
                const pos = nodePositions[n.id] || { x: n.x, y: n.y };
                const isSelected = selectedNode?.id === n.id;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onMouseDown={handleMouseDown(n.id)}
                    style={{ cursor: "grab" }}
                  >
                    {/* Pulsing selection aura */}
                    {isSelected && (
                      <circle
                        r={28}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Node Circle */}
                    <circle
                      r={19}
                      fill={isSelected ? "var(--grad-gold)" : "#101524"}
                      stroke={isSelected ? "#FFFFFF" : n.type === 'Case' ? "var(--blue)" : n.type === 'Judge' ? "var(--purple)" : "var(--gold)"}
                      strokeWidth={2}
                      style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }}
                    />

                    {/* Type Initial */}
                    <text
                      y={4}
                      textAnchor="middle"
                      fill={isSelected ? "#07090E" : "#FFFFFF"}
                      fontSize="11.5"
                      fontWeight="800"
                      fontFamily="'IBM Plex Mono', monospace"
                      style={{ pointerEvents: "none" }}
                    >
                      {n.type[0]}
                    </text>

                    {/* Node Name */}
                    <text
                      y={34}
                      textAnchor="middle"
                      fill={isSelected ? "var(--gold-light)" : "var(--text)"}
                      fontSize="11.5"
                      fontWeight="700"
                      style={{ pointerEvents: "none" }}
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Node Details Inspector */}
        <div className="jm-card" style={{ height: 600, display: "flex", flexDirection: "column", border: "1px solid var(--card-border-glow)" }}>
          {selectedNode ? (
            <div className="jm-animate-pop-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span className="jm-badge jm-badge-gold">
                  {selectedNode.type}
                </span>
                <span className="jm-mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  ID: {selectedNode.id}
                </span>
              </div>

              <h3 className="jm-display" style={{ fontSize: 21, margin: "0 0 12px", color: "var(--text)" }}>
                {selectedNode.label}
              </h3>

              <div style={{ background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 10, padding: 14, marginBottom: 18 }}>
                <div className="jm-card-label" style={{ marginBottom: 4, color: "var(--gold-light)" }}>Precedent Summary</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {selectedNode.details}
                </p>
              </div>

              <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>Direct Graph Precedent Links</div>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {EDGES.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id).map((edge, idx) => {
                  const otherId = edge.from === selectedNode.id ? edge.to : edge.from;
                  const otherNode = NODES.find((n) => n.id === otherId);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedNode(otherNode)}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--card-border)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{otherNode?.label}</div>
                        <div style={{ fontSize: 11, color: "var(--gold-light)", marginTop: 2 }} className="jm-mono">
                          {edge.from === selectedNode.id ? `→ ${edge.label}` : `← ${edge.label}`}
                        </div>
                      </div>
                      <ChevronRight size={15} style={{ color: "var(--gold)" }} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13 }}>
              Select any node to view precedent connections.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
