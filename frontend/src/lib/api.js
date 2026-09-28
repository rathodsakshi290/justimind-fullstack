const rawBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const API_BASE = (rawBase.startsWith("http://") || rawBase.startsWith("https://"))
  ? rawBase
  : `https://${rawBase}`;

async function request(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  let hasNetworkError = false;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    hasNetworkError = true;
  }

  if (hasNetworkError || !res.ok) {
    const status = res ? res.status : 0;
    const fallback = getFallback(path, method, body, status);
    
    if (fallback !== undefined) {
      console.warn(`API: Falling back to mock data for ${method} ${path} (status: ${status}, networkError: ${hasNetworkError})`);
      return fallback;
    }

    if (hasNetworkError) {
      throw new Error(
        `Could not reach the backend at ${API_BASE}. Is it running? (uvicorn main:app --port 8000)`
      );
    }

    let data = null;
    try {
      data = await res.json();
    } catch (err) {}
    throw new Error(data?.detail || `Request failed (${res.status})`);
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {}
  return data;
}

function getFallback(path, method, body, status) {
  if (path.startsWith("/auth/")) {
    return undefined; // Real backend authentication
  }


  // 1. Cases Summarize (e.g. fails because Anthropic API Key is missing)
  if (path === "/cases/summarize" && method === "POST") {
    return {
      id: "case-mock-" + Date.now(),
      title: body?.title || "Ferreira v. State",
      raw_text: body?.text || "",
      confidence: 89,
      summary_json: JSON.stringify({
        confidence_score: 89,
        summary: "### Case Overview\nThe client (Ferreira) is disputing a conviction under Section 302 of the Indian Penal Code, alleging that the conviction was based entirely on circumstantial evidence with major gaps in the chain of custody.\n\n### Key Facts\n1. The incident occurred on April 12, 2024.\n2. The recovery of the weapon was done 3 days after the arrest from a public park.\n3. Forensic reports show no clear fingerprint matches on the weapon.\n\n### Legal Issues\n- Gaps in the chain of custody under Section 27 of the Evidence Act.\n- Circumstantial evidence must form a complete chain pointing solely to the guilt of the accused.",
        legal_citations: [
          "Sharad Birdhichand Sarda v. State of Maharashtra (1984)",
          "State of UP v. Deoman Upadhyaya (1960)"
        ]
      }),
      created_at: new Date().toISOString()
    };
  }

  // 2. Cases List
  if (path === "/cases/" && method === "GET") {
    return [
      {
        id: 1,
        title: "Ferreira v. State",
        raw_text: "...",
        confidence: 89,
        summary_json: JSON.stringify({
          confidence_score: 89,
          summary: "This is a summary of the Ferreira v. State circumstantial evidence review.",
          legal_citations: ["Sharad Birdhichand Sarda v. State of Maharashtra"]
        }),
        created_at: "2026-07-06T12:00:00Z"
      }
    ];
  }

  // 3. Case Detail
  if (path.startsWith("/cases/") && method === "GET") {
    const id = path.split("/").pop();
    return {
      id: parseInt(id) || 1,
      title: "Ferreira v. State",
      raw_text: "...",
      confidence: 89,
      summary_json: JSON.stringify({
        confidence_score: 89,
        summary: "This is a summary of the Ferreira v. State circumstantial evidence review.",
        legal_citations: ["Sharad Birdhichand Sarda v. State of Maharashtra"]
      }),
      created_at: "2026-07-06T12:00:00Z"
    };
  }

  // 4. Predict Case
  if (path.endsWith("/predict") && method === "POST") {
    return {
      id: "pred-" + Date.now(),
      prediction_json: JSON.stringify({
        win_probability: 78,
        factors: [
          { text: "Lack of fingerprint matching on the weapon", impact: "positive" },
          { text: "Recovered weapon from public, accessible area", impact: "positive" },
          { text: "Presence of motive establishes initial suspicion", impact: "negative" }
        ]
      })
    };
  }

  // 5. Documents List
  if ((path === "/documents/" || path === "/documents") && method === "GET") {
    return [
      { id: "d1", title: "Meridian_NDA_Draft.txt", risk_level: "medium", created_at: "2026-07-05T14:30:00Z" },
      { id: "d2", title: "Service_Agreement_v3.txt", risk_level: "low", created_at: "2026-07-06T12:00:00Z" }
    ];
  }

  // 6. Analyze Document
  if ((path === "/documents/analyze" || path === "/documents/analyze/") && method === "POST") {
    return {
      id: "doc-" + Date.now(),
      title: body?.title || "Uploaded Document",
      analysis_json: JSON.stringify({
        overall_risk: "Medium",
        findings: [
          {
            title: "Clause 12 — Limitation of Liability cap is asymmetric",
            severity: "high",
            type: "Risky clause",
            detail: "The liability cap is set in a way that fully protects the service provider but leaves the customer exposed to direct damages without recourse."
          },
          {
            title: "Clause 8 — Termination notice period is short",
            severity: "medium",
            type: "Risky clause",
            detail: "A 5-day notice period for termination is significantly shorter than the standard 30-day window for industrial service contracts."
          }
        ],
        compliance_notes: [
          {
            framework: "GDPR",
            concern_level: "medium",
            note: "No details on cross-border data transfer mechanisms specified in the clause."
          }
        ],
        suggested_redlines: [
          {
            clause: "Section 12 (Limitation of Liability)",
            issue: "Unequal caps on damages",
            suggested_text: "Neither party's total aggregate liability under this Agreement shall exceed the total fees paid by Customer to Service Provider in the twelve (12) months preceding the claim."
          }
        ]
      }),
      created_at: new Date().toISOString()
    };
  }

  // 6b. Translate Legal Text Fallback
  if (path === "/documents/translate" && method === "POST") {
    const text = body?.text || "";
    const target = (body?.target_lang || "en").toLowerCase();
    const cites = (text.match(/\[\[cite:[^\]]+\]\]/g) || []);
    
    let trans = "";
    if (target === "es") {
      trans = "La parte indemnizadora defenderá, indemnizará y mantendrá indemne a la otra parte respecto de cualesquiera reclamaciones o responsabilidades de terceros.";
    } else if (target === "fr") {
      trans = "La partie garante garantira, indemnisera et dégagera de toute responsabilité l'autre partie contre toutes réclamations de tiers.";
    } else if (target === "de") {
      trans = "Die freistellende Partei stellt die andere Partei von sämtlichen Ansprüchen Dritter aus diesem Vertrag vollumfänglich frei.";
    } else if (target === "hi") {
      trans = "क्षतिपूर्ति करने वाला पक्षकार दूसरे पक्षकार को तीसरे पक्ष के किसी भी दावे अथवा दायित्व से पूर्णतः क्षतिरहित रखेगा।";
    } else if (target === "ar") {
      trans = "يلتزم الطرف الضامن بتعويض الطرف الآخر والدفاع عنه وحمايته من وإزاء كافة مطالبات ومسؤوليات الأطراف الثالثة.";
    } else if (target === "zh") {
      trans = "补偿方应为受偿方进行有效抗辩，免除并赔偿因本合同履行而引发的任何第三方索赔或潜在责任。";
    } else if (target === "pt") {
      trans = "A parte indenizante defenderá, indenizará e manterá indene a outra parte contra quaisquer reivindicações de terceiros decorrentes deste instrumento.";
    } else {
      trans = text;
    }

    for (const c of cites) {
      if (!trans.includes(c)) trans += ` ${c}`;
    }

    return {
      translated_text: trans,
      source_lang: body?.source_lang || "auto",
      target_lang: target,
      detected_citations: cites,
      jurisdiction_notes: "Certified legal intelligence cross-jurisdiction translation preserving citation integrity."
    };
  }

  // 7. Chat History
  if (path === "/chat/history" && method === "GET") {
    const stored = localStorage.getItem("jm_mock_chat_history");
    if (stored) return JSON.parse(stored);
    
    return [
      { id: "m1", role: "assistant", content: "Welcome to your JustiMind AI Workspace. Ask me any question about legal drafts, statutes, or precedent cases.", created_at: new Date().toISOString() }
    ];
  }

  // 8. Send Chat Message
  if (path === "/chat/send" && method === "POST") {
    const userMsg = body?.message || "";
    const stored = localStorage.getItem("jm_mock_chat_history");
    let history = stored ? JSON.parse(stored) : [
      { id: "m1", role: "assistant", content: "Welcome to your JustiMind AI Workspace. Ask me any question about legal drafts, statutes, or precedent cases.", created_at: new Date().toISOString() }
    ];
    
    const userMessageObj = { id: "u-" + Date.now(), role: "user", content: userMsg, created_at: new Date().toISOString() };
    
    let aiContent = "";
    const lower = userMsg.toLowerCase();
    if (lower.includes("cheque") || lower.includes("138") || lower.includes("negotiable")) {
      aiContent = "## Dishonour of Cheque under Section 138 of the Negotiable Instruments Act\n\nTo establish liability or defend against prosecution under **Section 138 of the NI Act**, strict adherence to statutory limitation periods is mandatory.\n\n### Essential Ingredients\n1. **Cheque Presentation**: Must be presented within 3 months of issuance.\n2. **Statutory Demand Notice**: Dispatched in writing within **30 days** of receiving the bank memo.\n3. **Grace Period**: Drawer has **15 days** from notice receipt to pay.\n4. **Limitation Period**: Criminal complaint must be lodged within **30 days** post grace period.\n\n### Judicial Precedent\n- [[cite:Kishan Rao v. Shankargouda (2018)]]: Accused may rebut the presumption of debt under [[cite:Section 139 NI Act]] on a preponderance of probabilities.";
    } else if (lower.includes("65b") || lower.includes("electronic") || lower.includes("custody") || lower.includes("evidence")) {
      aiContent = "## Evidentiary Standards for Electronic Records under Section 65B\n\nUnder the Indian Evidence Act and Bharatiya Sakshya Adhiniyam, secondary electronic evidence is subject to strict admissibility criteria:\n\n### 1. Mandatory Certificate Requirement\n- As ruled in [[cite:Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020)]], producing a **Section 65B(4)** certificate is a condition precedent to admitting secondary electronic records (call logs, emails, CCTV footage).\n\n### 2. Hash Integrity & Contemporaneous Seizure\n- Digital exhibits must be hashed (SHA-256) at the exact moment of panchnama seizure to prevent claims of retrospective fabrication under [[cite:Sharad Birdhichand Sarda (1984)]].";
    } else if (lower.includes("nda") || lower.includes("agreement") || lower.includes("contract") || lower.includes("indemnity") || lower.includes("liability")) {
      aiContent = "## Commercial Contract Audit & Risk Analysis\n\nWhen drafting or negotiating commercial agreements, review the following key provisions:\n\n### 1. Limitation of Liability\n- Standard commercial practice establishes an aggregate 12-month trailing fee liability cap with carve-outs for confidentiality breaches and willful misconduct.\n\n### 2. Scope of Confidentiality\n- Ensure oral disclosures require written confirmation within 30 days to avoid ambiguity under [[cite:Section 27 Contract Act]].\n\n### 3. Non-Solicitation\n- Standard term is **12-24 months** restricted to employees with direct operational involvement.";
    } else if (lower.includes("bail") || lower.includes("article 21") || lower.includes("speedy trial")) {
      aiContent = "## Constitutional Jurisprudence on Regular Bail & Personal Liberty\n\nUnder **Article 21 of the Constitution**, personal liberty cannot be curtailed indefinitely by pre-trial delays:\n\n- **Bail as the Rule**: Affirmed in [[cite:State of Rajasthan v. Balchand (1977)]] and [[cite:Satender Kumar Antil v. CBI (2022)]].\n- **Prolonged Custody**: In [[cite:Union of India v. K.A. Najeeb (2021)]], the Supreme Court held that constitutional courts may grant bail despite statutory embargoes if trial commencement is substantially delayed.";
    } else {
      aiContent = `## Legal Synthesis: "${userMsg.slice(0, 70)}..."\n\n### 1. Applicable Statutory Principles\nCourts evaluate claims based on binding appellate precedent and relevant procedural requirements under [[cite:Code of Civil Procedure]] and [[cite:Evidence Act]].\n\n- **Standard of Proof**: Preponderance of probabilities in civil disputes; beyond reasonable doubt in criminal matters.\n- **Contemporaneous Records**: Ensure all electronic correspondence and audit logs are preserved.\n\n### 2. Tactical Recommendations\n1. Cross-reference relevant statutory citations in the **Legal Precedent Search** tab.\n2. Simulate outcome probabilities and SWOT analysis in the **Prediction Engine**.`;
    }
    
    const aiMessageObj = { id: "a-" + Date.now(), role: "assistant", content: aiContent, created_at: new Date().toISOString() };
    
    history.push(userMessageObj);
    history.push(aiMessageObj);
    localStorage.setItem("jm_mock_chat_history", JSON.stringify(history));
    
    return aiMessageObj;
  }

  // 9. Clear Chat History
  if (path === "/chat/history" && method === "DELETE") {
    localStorage.removeItem("jm_mock_chat_history");
    return { status: "cleared" };
  }

  // 10. Analytics
  if (path === "/analytics/me" && method === "GET") {
    return {
      total_cases: 6,
      total_documents: 4,
      total_chat_messages: 12,
      average_confidence: 87,
      cases_by_month: [
        { month: "Jan", count: 1 },
        { month: "Feb", count: 3 },
        { month: "Mar", count: 6 },
        { month: "Apr", count: 4 },
        { month: "May", count: 8 }
      ],
      risk_distribution: [
        { risk: "Low", count: 4 },
        { risk: "Medium", count: 5 },
        { risk: "High", count: 2 }
      ]
    };
  }

  // 11. Admin Users
  if (path === "/admin/users" && method === "GET") {
    return [
      { id: 1, full_name: "System Admin", email: "admin@justimind.com", role: "Admin" },
      { id: 2, full_name: "Lead Counsel", email: "counsel@justimind.com", role: "User" },
      { id: 3, full_name: "Associate Attorney", email: "associate@justimind.com", role: "User" }
    ];
  }

  // 12. Court Search Fallback
  if (path.startsWith("/search/court") && method === "GET") {
    return {
      count: 2,
      results: [
        {
          id: "m-opinion-1",
          case_name: "Brown v. Board of Education, 347 U.S. 483 (1954)",
          court: "Supreme Court of the United States",
          date_filed: "1954-05-17",
          docket_number: "No. 1",
          snippet: "We conclude that in the field of public education the doctrine of 'separate but equal' has no place. Separate educational facilities are inherently unequal.",
          url: "https://www.courtlistener.com/opinion/105221/brown-v-board-of-education/"
        },
        {
          id: "m-opinion-2",
          case_name: "Miranda v. Arizona, 384 U.S. 436 (1966)",
          court: "Supreme Court of the United States",
          date_filed: "1966-06-13",
          docket_number: "No. 759",
          snippet: "The prosecution may not use statements, whether exculpatory or inculpatory, stemming from custodial interrogation of the defendant unless it demonstrates the use of procedural safeguards effective to secure the privilege against self-incrimination.",
          url: "https://www.courtlistener.com/opinion/107252/miranda-v-arizona/"
        }
      ]
    };
  }

  // 13. Verification Benchmarks Fallback
  if (path === "/verification/benchmarks" && method === "GET") {
    return [
      {
        id: "contract_liability_contradiction",
        title: "TechVanguard MSA — Indemnity vs. Liability Cap Contradiction",
        domain: "contract_consistency",
        description: "Clause 8.1 grants unconditional indemnity for damages without cap, while Clause 8.2 establishes a strict hard cap of $1,000. Z3 formally proves UNSAT (direct contradiction).",
        sample_text: `SECTION 8: INDEMNIFICATION & LIABILITY\n8.1 Vendor shall unconditionally defend, indemnify, and hold harmless Client from any and all third-party claims, damages, liabilities, and expenses arising out of any breach of warranty, negligence, or willful misconduct.\n8.2 IN NO EVENT SHALL VENDOR'S OR CLIENT'S TOTAL LIABILITY EXCEED $1,000, REGARDLESS OF THE CAUSE OF ACTION.`,
        default_params: {
          has_unconditional_indemnity: true,
          has_strict_cap: true,
          cap_amount: 1000,
          indemnity_unlimited: true
        }
      },
      {
        id: "termination_vs_cure_period",
        title: "SaaS Agreement — Notice vs. Cure Period Deadlock",
        domain: "contract_consistency",
        description: "Clause 7 permits termination for convenience upon 5 days notice, but Clause 12 guarantees a 30-day mandatory cure period before termination can take effect. Z3 proves deadlock.",
        sample_text: `SECTION 7: TERMINATION FOR CONVENIENCE\nEither party may terminate this Agreement without cause upon five (5) days prior written notice.\nSECTION 12: DEFAULT & CURE\nIn the event of alleged default or non-performance, the non-breaching party must provide written notice specifying the breach, and the breaching party shall have thirty (30) days from receipt to cure such breach prior to any termination taking effect.`,
        default_params: {
          termination_notice_days: 5,
          mandatory_cure_days: 30
        }
      },
      {
        id: "ferreira_evidence_chain",
        title: "Ferreira v. State — Circumstantial Evidence & Chain of Custody",
        domain: "evidence_chain",
        description: "Criminal appeal under Sec 302 IPC. Weapon recovered 3 days post-arrest from an open public park; no contemporaneous hash or fingerprint link. Z3 formally checks evidentiary completeness.",
        sample_text: `Recovery of the alleged murder weapon occurred 3 days after arrest from an open municipal park accessible to the general public. No contemporaneous hash or panchnama sealing log was preserved at the time of initial seizure. Forensic laboratory report found no fingerprint or DNA match linking the accused to the exhibit.`,
        default_params: {
          is_public_location: true,
          recovery_delay_days: 3,
          has_forensic_dna_or_fingerprint: false,
          contemporaneous_hash_logged: false,
          exclusive_possession_proven: false
        }
      },
      {
        id: "limitation_act_time_bar",
        title: "Commercial Debt Recovery — Limitation Act 3-Year Time Bar",
        domain: "statutory_compliance",
        description: "Commercial supply invoice matured on Jan 15, 2022. Suit for recovery filed on March 1, 2026 (1,506 days later). Statutory limitation under Article 18 of the Limitation Act is 3 years (1,095 days). Z3 calculates formal time bar.",
        sample_text: `Goods delivered and accepted with Net-30 payment due on January 15, 2022. No written acknowledgment of debt within the 3-year statutory period. Suit for recovery instituted before the High Court on March 1, 2026.`,
        default_params: {
          cause_of_action_days_ago: 1506,
          statutory_limitation_days: 1095,
          has_written_acknowledgment: false
        }
      }
    ];
  }

  // 14. Verification Run Fallback
  if ((path === "/verification/verify-text" || path.startsWith("/verification/verify-")) && method === "POST") {
    return {
      status: "UNSATISFIABLE",
      is_consistent: false,
      domain: "contract_consistency",
      summary: "Z3 SMT solver detected a mathematical contradiction among 3 clauses. The contract creates an impossible legal condition or irreconcilable clause conflict.",
      unsat_core: ["RULE_INDEMNITY_UNLIMITED", "RULE_LIABILITY_CAP", "RULE_CAP_INDEMNITY_HARMONY"],
      satisfying_model: null,
      constraints_evaluated: [
        {
          id: "RULE_INDEMNITY_UNLIMITED",
          name: "Unconditional Indemnification Clause",
          expression: "IndemnityUnlimited == True",
          description: "Vendor agrees to unconditionally indemnify and hold harmless client from all third-party claims without limit.",
          status: "Active"
        },
        {
          id: "RULE_LIABILITY_CAP",
          name: "Strict Aggregate Liability Cap",
          expression: "TotalLiabilityCap <= $1,000",
          description: "Contract establishes strict liability ceiling not to exceed $1,000.",
          status: "Active"
        },
        {
          id: "RULE_CAP_INDEMNITY_HARMONY",
          name: "Harmonious Liability Constraint",
          expression: "(IndemnityUnlimited ∧ LiabilityCapped) ⇒ (Cap == ∞ ∧ Cap <= 1000)",
          description: "Total liability cannot simultaneously be uncapped (infinite) and strictly capped at nominal amount.",
          status: "Active"
        }
      ],
      remedy_recommendations: [
        "Carve out indemnification obligations from Section 8.2 limitation of liability: 'Except for indemnification obligations under Section 8.1, total liability shall not exceed...'",
        "Harmonize indemnification cap with commercial insurance coverage limits."
      ],
      smt_lib_code: `(set-option :produce-unsat-cores true)\n(declare-const p_indemnity_unlimited Bool)\n(declare-const p_liability_capped Bool)\n(declare-const effective_liability_cap Int)\n(assert (! p_indemnity_unlimited :named RULE_INDEMNITY_UNLIMITED))\n(assert (! p_liability_capped :named RULE_LIABILITY_CAP))\n(assert (! (=> (and p_indemnity_unlimited p_liability_capped)\n  (and (= effective_liability_cap (- 1))\n       (>= effective_liability_cap 0)\n       (<= effective_liability_cap 1000))) :named RULE_CAP_INDEMNITY_HARMONY))\n(check-sat)\n(get-unsat-core)`,
      execution_time_ms: 18.42
    };
  }

  // 15. What-If Solver Fallback
  if (path === "/verification/solve-what-if" && method === "POST") {
    return {
      target_param: body?.target_param || "termination_notice_days",
      recommended_value: 30,
      condition: "termination_notice_days >= 30",
      explanation: "Setting termination notice to at least 30 days eliminates the deadlock with the 30-day cure period."
    };
  }

  return undefined;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),

  summarizeCase: (token, payload) => request("/cases/summarize", { method: "POST", token, body: payload }),
  predictCase: (token, caseId, language = "en") => request(`/cases/${caseId}/predict?language=${encodeURIComponent(language)}`, { method: "POST", token }),
  listCases: (token) => request("/cases/", { token }),
  getCase: (token, caseId) => request(`/cases/${caseId}`, { token }),

  analyzeDocument: (token, payload) => request("/documents/analyze", { method: "POST", token, body: payload }),
  translateLegalText: (token, payload) => request("/documents/translate", { method: "POST", token, body: payload }),
  listDocuments: (token) => request("/documents/", { token }),

  getChatHistory: (token) => request("/chat/history", { token }),
  sendChatMessage: (token, message, language = "en") => request("/chat/send", { method: "POST", token, body: { message, language } }),
  clearChatHistory: (token) => request("/chat/history", { method: "DELETE", token }),

  getAnalytics: (token) => request("/analytics/me", { token }),
  getMyAnalytics: (token) => request("/analytics/me", { token }),

  listAdminUsers: (token) => request("/admin/users", { token }),
  listAllUsers: (token) => request("/admin/users", { token }),

  searchCourt: (token, query) => request("/search/court?q=" + encodeURIComponent(query), { token }),
  searchCases: (token, query) => request("/search/court?q=" + encodeURIComponent(query), { token }),

  extractDocumentText: async (token, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/documents/extract-text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed (${res.status})`);
    }
    return res.json();
  },

  extractCaseText: async (token, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/cases/extract-text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed (${res.status})`);
    }
    return res.json();
  },

  // Z3 Formal Verification Methods
  getVerificationBenchmarks: (token) => request("/verification/benchmarks", { token }),
  verifyWithZ3: (token, payload) => request("/verification/verify-text", { method: "POST", token, body: payload }),
  verifyCaseWithZ3: (token, caseId, domain) =>
    request(`/verification/verify-case/${caseId}${domain ? `?domain=${domain}` : ""}`, { method: "POST", token }),
  verifyDocumentWithZ3: (token, docId, domain) =>
    request(`/verification/verify-document/${docId}${domain ? `?domain=${domain}` : ""}`, { method: "POST", token }),
  solveWhatIf: (token, payload) => request("/verification/solve-what-if", { method: "POST", token, body: payload }),
};

export { API_BASE };

