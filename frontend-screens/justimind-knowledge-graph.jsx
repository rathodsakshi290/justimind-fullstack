import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Scale, Sun, Moon, Search, ZoomIn, ZoomOut, Maximize2, Gavel, FileText,
  BookOpen, Users, Landmark, X
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — Knowledge Graph                                       */
/*  Same token system as the rest of the product.                     */
/* ------------------------------------------------------------------ */

const NODE_TYPES = {
  case: { color: "#22D3EE", icon: FileText, label: "Case" },
  judge: { color: "#7B3FE4", icon: Gavel, label: "Judge" },
  act: { color: "#2547F4", icon: BookOpen, label: "Act / Section" },
  court: { color: "#4F8CFF", icon: Landmark, label: "Court" },
  lawyer: { color: "#a855f7", icon: Users, label: "Lawyer" },
};

const INITIAL_NODES = [
  { id: "c1", type: "case", label: "Ferreira v. State", x: 420, y: 120, detail: "Civil claim, District Court, 2023. Cited for chain-of-custody precedent." },
  { id: "c2", type: "case", label: "Whitmore v. County", x: 620, y: 200, detail: "Settled 2022. Referenced for damages calculation method." },
  { id: "c3", type: "case", label: "Reyes v. Northgate", x: 260, y: 260, detail: "Plaintiff-favorable, 2021. Shares evidence pattern with Ferreira." },
  { id: "c4", type: "case", label: "Dunbar v. State", x: 500, y: 380, detail: "Defendant-favorable, 2020. Distinguished on notice-period grounds." },
  { id: "j1", type: "judge", label: "Judge R. Anand", x: 340, y: 190, detail: "Presided over Ferreira v. State. 74% plaintiff-favorable ruling rate." },
  { id: "j2", type: "judge", label: "Judge P. Kwan", x: 560, y: 310, detail: "Presided over Whitmore v. County. Known for strict evidentiary standards." },
  { id: "a1", type: "act", label: "Art. 21 · Constitution", x: 200, y: 130, detail: "Right to life and liberty — cited in 3 connected cases." },
  { id: "a2", type: "act", label: "Sec. 138 · NI Act", x: 700, y: 110, detail: "Cheque dishonor provision — referenced in 2 connected cases." },
  { id: "a3", type: "act", label: "Evidence Act, Sec. 45", x: 400, y: 300, detail: "Expert opinion admissibility — central to the chain-of-custody dispute." },
  { id: "ct1", type: "court", label: "District Court", x: 320, y: 380, detail: "Original venue for 2 of the 4 connected cases." },
  { id: "ct2", type: "court", label: "High Court", x: 640, y: 400, detail: "Appellate venue — 1 connected case under review." },
  { id: "l1", type: "lawyer", label: "A. Bellweather, Esq.", x: 180, y: 340, detail: "Counsel of record in Reyes v. Northgate and Ferreira v. State." },
];

const EDGES = [
  ["c1", "j1"], ["c1", "a1"], ["c1", "a3"], ["c1", "ct1"], ["c1", "l1"],
  ["c2", "j2"], ["c2", "a2"], ["c2", "ct2"],
  ["c3", "a1"], ["c3", "l1"], ["c3", "ct1"],
  ["c4", "a3"], ["c4", "ct2"],
  ["c1", "c3"], ["c1", "c4"],
];

export default function JustiMindKnowledgeGraph() {
  const [theme, setTheme] = useState("dark");
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const panRef = useRef(null);
  const svgRef = useRef(null);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const matches = useCallback((n) => query.trim() && n.label.toLowerCase().includes(query.trim().toLowerCase()), [query]);
  const anyQuery = query.trim().length > 0;

  const nodeById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const startDragNode = (id) => (e) => {
    e.stopPropagation();
    const svgRect = svgRef.current.getBoundingClientRect();
    dragRef.current = { id, offsetX: e.clientX, offsetY: e.clientY };
    const node = nodeById[id];
    dragRef.current.startX = node.x;
    dragRef.current.startY = node.y;
    setSelected(id);
  };

  const onMouseMove = (e) => {
    if (dragRef.current) {
      const dx = (e.clientX - dragRef.current.offsetX) / zoom;
      const dy = (e.clientY - dragRef.current.offsetY) / zoom;
      setNodes((ns) => ns.map((n) => n.id === dragRef.current.id ? { ...n, x: dragRef.current.startX + dx, y: dragRef.current.startY + dy } : n));
    } else if (panRef.current) {
      const dx = e.clientX - panRef.current.startX;
      const dy = e.clientY - panRef.current.startY;
      setPan({ x: panRef.current.baseX + dx, y: panRef.current.baseY + dy });
    }
  };
  const onMouseUp = () => { dragRef.current = null; panRef.current = null; };
  const startPan = (e) => {
    panRef.current = { startX: e.clientX, startY: e.clientY, baseX: pan.x, baseY: pan.y };
  };

  const selectedNode = selected ? nodeById[selected] : null;
  const connections = selectedNode ? EDGES.filter(([a, b]) => a === selected || b === selected).map(([a, b]) => (a === selected ? b : a)) : [];

  return (
    <div className={`kg-root kg-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .kg-root {
          --bg: #050505; --surface: #0a0a0d; --card: #121212; --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa; --text-muted: #9a9db3;
          --royal: #2547F4; --purple: #7B3FE4; --cyan: #22D3EE; --neon: #4F8CFF;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text);
          height: 100vh; display: flex; flex-direction: column; overflow: hidden;
          transition: background 0.4s, color 0.4s;
        }
        .kg-root.kg-theme-light {
          --bg: #f7f7fa; --surface: #ffffff; --card: #ffffff; --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14; --text-muted: #5b5f76;
        }
        .kg-root * { box-sizing: border-box; }
        .kg-mono { font-family: 'IBM Plex Mono', monospace; }

        .kg-topbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-bottom: 1px solid var(--card-border); flex-shrink: 0; }
        .kg-logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 15px; }
        .kg-logo-mark { width: 25px; height: 25px; border-radius: 7px; background: var(--grad); display: flex; align-items: center; justify-content: center; }
        .kg-search { display: flex; align-items: center; gap: 8px; background: var(--card); border: 1px solid var(--card-border); border-radius: 9px; padding: 8px 12px; width: 320px; }
        .kg-search input { border: none; background: transparent; outline: none; color: var(--text); font-size: 13px; flex: 1; font-family: 'Manrope', sans-serif; }
        .kg-icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--card-border); background: var(--card); display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
        .kg-icon-btn:hover { border-color: var(--neon); }
        .kg-actions { display: flex; gap: 8px; }

        .kg-body { flex: 1; display: flex; min-height: 0; }

        .kg-legend-panel { width: 210px; border-right: 1px solid var(--card-border); background: var(--surface); padding: 18px 16px; flex-shrink: 0; }
        .kg-panel-label { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
        .kg-legend-item { display: flex; align-items: center; gap: 9px; padding: 8px 0; font-size: 13px; }
        .kg-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .kg-legend-count { margin-left: auto; font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: var(--text-muted); }
        .kg-hint { font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--card-border); }

        .kg-canvas-wrap { flex: 1; position: relative; overflow: hidden; background:
          radial-gradient(circle at 1px 1px, var(--card-border) 1px, transparent 0) 0 0 / 26px 26px; cursor: grab; }
        .kg-canvas-wrap:active { cursor: grabbing; }
        .kg-zoom-controls { position: absolute; bottom: 18px; left: 18px; display: flex; flex-direction: column; gap: 6px; z-index: 5; }

        .kg-node-label { font-size: 11px; font-weight: 600; fill: var(--text); pointer-events: none; }
        .kg-node-sub { font-size: 9px; fill: var(--text-muted); pointer-events: none; }

        .kg-detail-panel { width: 300px; border-left: 1px solid var(--card-border); background: var(--surface); padding: 20px; flex-shrink: 0; overflow-y: auto; }
        .kg-detail-empty { color: var(--text-muted); font-size: 13px; text-align: center; margin-top: 60px; line-height: 1.6; }
        .kg-detail-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .kg-detail-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .kg-detail-type { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; text-transform: uppercase; color: var(--text-muted); }
        .kg-detail-title { font-size: 15.5px; font-weight: 700; margin: 10px 0 8px; }
        .kg-detail-text { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 18px; }
        .kg-conn-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--card-border); font-size: 12.5px; cursor: pointer; }
        .kg-conn-item:last-child { border-bottom: none; }
        .kg-close-btn { margin-left: auto; cursor: pointer; color: var(--text-muted); }

        @media (max-width: 900px) {
          .kg-legend-panel, .kg-detail-panel { display: none; }
          .kg-search { width: 180px; }
        }
      `}</style>

      {/* ---------------- Top bar ---------------- */}
      <div className="kg-topbar">
        <div className="kg-logo">
          <div className="kg-logo-mark"><Scale size={13} color="#fff" /></div>
          JustiMind
        </div>
        <div className="kg-search">
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search cases, judges, acts, courts…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="kg-actions">
          <button className="kg-icon-btn" onClick={toggleTheme}>{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}</button>
        </div>
      </div>

      <div className="kg-body">
        {/* ---------------- Legend ---------------- */}
        <aside className="kg-legend-panel">
          <div className="kg-panel-label">Node types</div>
          {Object.entries(NODE_TYPES).map(([key, t]) => (
            <div className="kg-legend-item" key={key}>
              <span className="kg-legend-dot" style={{ background: t.color }} />
              {t.label}
              <span className="kg-legend-count kg-mono">{nodes.filter((n) => n.type === key).length}</span>
            </div>
          ))}
          <div className="kg-hint">
            Drag nodes to rearrange. Drag empty space to pan. Click a node for details and its direct connections. Search dims everything except matches.
          </div>
        </aside>

        {/* ---------------- Canvas ---------------- */}
        <div
          className="kg-canvas-wrap"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onMouseDown={startPan}
        >
          <svg ref={svgRef} width="100%" height="100%" onClick={() => setSelected(null)}>
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {EDGES.map(([a, b], i) => {
                const na = nodeById[a], nb = nodeById[b];
                if (!na || !nb) return null;
                const dim = anyQuery && !(matches(na) || matches(nb));
                const highlight = selected && (a === selected || b === selected);
                return (
                  <line
                    key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    stroke={highlight ? "var(--cyan)" : "var(--card-border)"}
                    strokeWidth={highlight ? 2 : 1.2}
                    opacity={dim ? 0.15 : 1}
                  />
                );
              })}
              {nodes.map((n) => {
                const meta = NODE_TYPES[n.type];
                const dim = anyQuery && !matches(n);
                const isSelected = selected === n.id;
                const isConnected = connections.includes(n.id);
                const r = isSelected ? 20 : 14;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x}, ${n.y})`}
                    onMouseDown={startDragNode(n.id)}
                    style={{ cursor: "grab", opacity: dim ? 0.2 : 1 }}
                  >
                    {isSelected && <circle r={r + 8} fill={meta.color} opacity={0.15} />}
                    <circle
                      r={r}
                      fill={meta.color}
                      opacity={isConnected || isSelected ? 1 : 0.85}
                      stroke={isSelected ? "#fff" : "none"}
                      strokeWidth={2}
                    />
                    <text textAnchor="middle" y={r + 16} className="kg-node-label">{n.label}</text>
                    <text textAnchor="middle" y={r + 28} className="kg-node-sub">{meta.label}</text>
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="kg-zoom-controls">
            <button className="kg-icon-btn" onClick={() => setZoom((z) => Math.min(2, z + 0.15))}><ZoomIn size={14} /></button>
            <button className="kg-icon-btn" onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}><ZoomOut size={14} /></button>
            <button className="kg-icon-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><Maximize2 size={14} /></button>
          </div>
        </div>

        {/* ---------------- Detail panel ---------------- */}
        <aside className="kg-detail-panel">
          {!selectedNode && <div className="kg-detail-empty">Select a node to see its details and connections.</div>}
          {selectedNode && (
            <>
              <div className="kg-detail-head">
                <div className="kg-detail-icon" style={{ background: `${NODE_TYPES[selectedNode.type].color}22`, color: NODE_TYPES[selectedNode.type].color }}>
                  {React.createElement(NODE_TYPES[selectedNode.type].icon, { size: 16 })}
                </div>
                <span className="kg-detail-type">{NODE_TYPES[selectedNode.type].label}</span>
                <X size={16} className="kg-close-btn" onClick={() => setSelected(null)} />
              </div>
              <div className="kg-detail-title">{selectedNode.label}</div>
              <div className="kg-detail-text">{selectedNode.detail}</div>
              <div className="kg-panel-label">Connected ({connections.length})</div>
              {connections.map((cid) => {
                const cn = nodeById[cid];
                if (!cn) return null;
                return (
                  <div className="kg-conn-item" key={cid} onClick={() => setSelected(cid)}>
                    <span className="kg-legend-dot" style={{ background: NODE_TYPES[cn.type].color }} />
                    {cn.label}
                  </div>
                );
              })}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
