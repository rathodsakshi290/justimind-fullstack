import React, { useState, useEffect } from "react";
import {
  Newspaper, ExternalLink, Bookmark, ThumbsUp, Sparkles,
  Scale, Filter, Search, ChevronDown, ChevronUp, Share2, Check
} from "lucide-react";
import Layout from "../components/Layout";

const NEWS_ARTICLES = [
  {
    id: 1,
    category: "Supreme Court",
    title: "Supreme Court Clarifies Burden of Proof in Electronic Hash Log Admissibility",
    source: "Bar & Bench",
    date: "2 hours ago",
    readTime: "4 min read",
    summary: "A three-judge bench held that failure by prosecuting agencies to produce contemporaneous SHA-256 hash logs at the moment of electronic device seizure creates a rebuttable presumption of evidentiary compromise under Section 65B.",
    legalAnalysis: "This ruling raises the compliance threshold for cyber-forensic seizures. Defense teams in white-collar and criminal proceedings should immediately demand production of original acquisition logs.",
    citations: ["Section 65B Evidence Act", "Arjun Panditrao Precedent", "Article 21 Due Process"],
    likes: 42,
  },
  {
    id: 2,
    category: "Corporate & M&A",
    title: "FTC Finalizes Tougher Scrutiny Rules on Roll-Up Tech Acquisitions",
    source: "Global Competition Review",
    date: "5 hours ago",
    readTime: "6 min read",
    summary: "The antitrust commission released revised merger guidelines targeting serial acquisitions below traditional HSR reporting thresholds, citing cumulative competitive dampening.",
    legalAnalysis: "Private equity and venture portfolios must prepare for retroactive inquiries into series of bolt-on acquisitions spanning the prior 36 months.",
    citations: ["Clayton Act § 7", "HSR Act Exemption Rules", "Horizontal Merger Guidelines"],
    likes: 28,
  },
  {
    id: 3,
    category: "Intellectual Property",
    title: "Federal Circuit Reaffirms Strict Written Description Standards for AI Patent Claims",
    source: "Law360 IP",
    date: "1 day ago",
    readTime: "5 min read",
    summary: "In a split decision, the appellate court ruled that generic algorithmic descriptions without specific architectural training weights fail 35 U.S.C. § 112 requirements.",
    legalAnalysis: "Patent attorneys drafting AI and machine learning claims must disclose detailed network topology and loss-function formulation to survive Section 112 rejections.",
    citations: ["35 U.S.C. § 112", "Alice Corp. Step 2A", "Fed. Cir. Appeal 23-1490"],
    likes: 67,
  },
  {
    id: 4,
    category: "Arbitration",
    title: "Emergency Arbitrator Injunction Enforceability Upheld Under UNCITRAL Model",
    source: "Kluwer Arbitration",
    date: "2 days ago",
    readTime: "3 min read",
    summary: "High Court confirms that interim protective orders granted by emergency arbitrators in cross-border asset freezing disputes are directly executable under Section 17.",
    legalAnalysis: "Substantially strengthens international commercial arbitration options for multinational creditors seeking swift asset protection.",
    citations: ["Arbitration & Conciliation Act § 17", "UNCITRAL Model Law Art. 17J"],
    likes: 31,
  },
];

const CATEGORIES = ["All", "Supreme Court", "Corporate & M&A", "Intellectual Property", "Arbitration"];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAnalysisId, setExpandedAnalysisId] = useState(null);
  const [likes, setLikes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jm_news_likes") || "{}"); } catch { return {}; }
  });
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jm_news_bookmarks") || "{}"); } catch { return {}; }
  });
  const [copiedId, setCopiedId] = useState(null);

  const toggleLike = (id) => {
    const next = { ...likes, [id]: !likes[id] };
    setLikes(next);
    localStorage.setItem("jm_news_likes", JSON.stringify(next));
  };

  const toggleBookmark = (id) => {
    const next = { ...bookmarks, [id]: !bookmarks[id] };
    setBookmarks(next);
    localStorage.setItem("jm_news_bookmarks", JSON.stringify(next));
  };

  const handleShare = (article) => {
    navigator.clipboard.writeText(`${article.title} - ${article.source}`);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredArticles = NEWS_ARTICLES.filter((a) => {
    const matchesCat = activeCategory === "All" || a.category === activeCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Layout title="Legal Intelligence & News Feed">
      <div className="jm-info">
        <Newspaper size={15} style={{ flexShrink: 0, marginTop: 1, color: "var(--blue)" }} />
        Curated daily legal intelligence with strategic counsel takeaways, statutory citations, and precedent impact notes.
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "var(--grad-gold)" : "var(--surface)",
                border: activeCategory === cat ? "1px solid var(--gold)" : "1px solid var(--card-border)",
                color: activeCategory === cat ? "var(--accent-contrast)" : "var(--text-muted)",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: activeCategory === cat ? "0 2px 8px var(--gold-glow)" : "none",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", width: 250 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
          <input
            style={{
              width: "100%",
              padding: "8px 10px 8px 34px",
              fontSize: 13,
              background: "var(--input-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: 8,
              color: "var(--text)",
            }}
            placeholder="Search news & statutes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* News Article Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 20 }}>
        {filteredArticles.map((article) => {
          const isLiked = !!likes[article.id];
          const isBookmarked = !!bookmarks[article.id];
          const isExpanded = expandedAnalysisId === article.id;

          return (
            <div key={article.id} className="jm-card" style={{ display: "flex", flexDirection: "column", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="jm-badge jm-badge-gold">
                  {article.category}
                </span>
                <span className="jm-mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  {article.source} • {article.date}
                </span>
              </div>

              <h3 className="jm-display" style={{ fontSize: 18, fontWeight: 600, margin: "0 0 10px", lineHeight: 1.4, color: "var(--text)" }}>
                {article.title}
              </h3>

              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65, flex: 1, margin: "0 0 16px" }}>
                {article.summary}
              </p>

              {/* Citations */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {article.citations.map((c, i) => (
                  <span
                    key={i}
                    className="jm-badge jm-badge-blue"
                    style={{ fontSize: 10.5, padding: "2px 7px" }}
                  >
                    <Scale size={10} /> {c}
                  </span>
                ))}
              </div>

              {/* Collapsible Strategic Analysis */}
              {isExpanded && (
                <div
                  className="jm-animate-pop-in"
                  style={{
                    background: "rgba(212, 175, 55, 0.06)",
                    border: "1px solid var(--card-border-glow)",
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 16,
                    fontSize: 13.5,
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6, color: "var(--gold-light)" }}>
                    <Sparkles size={14} style={{ color: "var(--gold)" }} /> JustiMind Strategic Counsel Takeaway:
                  </div>
                  <p style={{ margin: 0, color: "var(--text)" }}>{article.legalAnalysis}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--card-border)" }}>
                <button
                  onClick={() => setExpandedAnalysisId(isExpanded ? null : article.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--gold-light)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {isExpanded ? <>Collapse Analysis <ChevronUp size={14} /></> : <>Strategic Analysis <ChevronDown size={14} /></>}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => toggleLike(article.id)}
                    className="jm-icon-btn"
                    style={{ width: 32, height: 32, color: isLiked ? "var(--gold)" : "var(--text-muted)" }}
                    title="Like"
                  >
                    <ThumbsUp size={14} fill={isLiked ? "currentColor" : "none"} />
                  </button>

                  <button
                    onClick={() => toggleBookmark(article.id)}
                    className="jm-icon-btn"
                    style={{ width: 32, height: 32, color: isBookmarked ? "var(--gold)" : "var(--text-muted)" }}
                    title="Bookmark"
                  >
                    <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                  </button>

                  <button
                    onClick={() => handleShare(article)}
                    className="jm-icon-btn"
                    style={{ width: 32, height: 32 }}
                    title="Share citation"
                  >
                    {copiedId === article.id ? <Check size={14} style={{ color: "var(--good)" }} /> : <Share2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
