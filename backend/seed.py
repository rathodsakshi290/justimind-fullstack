import os
import json
import datetime
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import User, Case, Document, ChatMessage
from auth import hash_password

def seed_db():
    print("Initializing database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Clear existing database tables to ensure clean state
        print("Clearing existing tables...")
        db.query(ChatMessage).delete()
        db.query(Document).delete()
        db.query(Case).delete()
        db.query(User).delete()
        db.commit()

        # 2. Seed Users
        print("Seeding users...")
        users_to_seed = [
            {
                "email": "admin@justimind.com",
                "full_name": "System Admin",
                "password": "adminpassword",
                "role": "Admin",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=90)
            },
            {
                "email": "counsel@justimind.com",
                "full_name": "Lead Counsel",
                "password": "counselpassword",
                "role": "User",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=60)
            },
            {
                "email": "associate@justimind.com",
                "full_name": "Associate Attorney",
                "password": "associatepassword",
                "role": "User",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=30)
            },
            {
                "email": "sakshirathod.0529@gmail.com",
                "full_name": "Sakshi Rathod",
                "password": "password123",
                "role": "Admin",  # Mark as admin so they can access the Admin panel as well
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=10)
            }
        ]

        db_users = []
        for u in users_to_seed:
            user = User(
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
                created_at=u["created_at"]
            )
            db.add(user)
            db.flush()  # populate ID
            db_users.append(user)
        
        db.commit()
        print(f"Seeded {len(db_users)} users.")

        # 3. Seed Cases
        print("Seeding cases...")
        cases_to_seed = [
            {
                "title": "Ferreira v. State of Maharashtra",
                "raw_text": "Case Appeal under Section 374 CrPC challenging the conviction under Section 302 IPC. The prosecution case rests completely on circumstantial evidence. The physical evidence recovered consists of a kitchen knife alleged to be the murder weapon. However, recovery was made 3 days after arrest from a public park accessible to the general public. Gaps in the chain of custody are present. Forensic report submitted shows no fingerprint match of the appellant on the handle of the knife, and blood DNA was inconclusive.",
                "confidence": 89,
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=5),
                "summary": {
                    "confidence_score": 89,
                    "executive_summary": "Appeal challenging conviction under Section 302 IPC. The prosecution's case rests entirely on circumstantial evidence, centering on recovery of a weapon with significant custody gaps.",
                    "facts": [
                        "Appellant convicted under Section 302 IPC primarily based on recovery of a weapon (knife) three days post-arrest.",
                        "The recovery was made from an open, publicly accessible park.",
                        "No forensic finger-prints or blood DNA matches were found connecting the accused to the weapon."
                    ],
                    "issues": [
                        "Whether recovery under Section 27 of the Evidence Act is valid if the site is publicly accessible.",
                        "Whether circumstantial evidence forms a complete chain pointing exclusively to the guilt of the accused."
                    ],
                    "evidence": [
                        {"name": "Alleged murder weapon (knife)", "strength": 35},
                        {"name": "Circumstantial witness testimony", "strength": 55},
                        {"name": "Medical post-mortem report", "strength": 80}
                    ],
                    "timeline": [
                        {"date": "2026-04-10", "label": "Incident occurred in North Mumbai"},
                        {"date": "2026-04-12", "label": "Arrest of Ferreira"},
                        {"date": "2026-04-15", "label": "Recovery of weapon from public park"},
                        {"date": "2026-06-05", "label": "Forensic lab reports submitted"}
                    ],
                    "judgment_prediction": "Acquittal highly probable on appeal. Circumstantial evidence chain has critical gaps and physical evidence recovery lacks credibility.",
                    "recommendations": [
                        "Prioritize cross-examination of recovery witness regarding park access.",
                        "File motion to exclude weapon forensic report due to custody delay."
                    ]
                },
                "prediction": {
                    "win_probability": 78,
                    "settlement_probability": 15,
                    "loss_probability": 7,
                    "expected_outcome_note": "High likelihood of acquittal or reversal on appeal due to critical gaps in the chain of custody of key physical evidence.",
                    "evidence_strength": 82,
                    "precedent_alignment": 85,
                    "risk_level": "Medium",
                    "estimated_duration": "6 - 9 months",
                    "reasoning_chain": [
                        "The recovery of the alleged weapon from a public park 3 days after arrest weakens the prosecution's link under Section 27 of the Evidence Act.",
                        "Forensic reports indicate no fingerprint matches or DNA trace connecting the accused to the weapon.",
                        "Precedent (Sharad Birdhichand Sarda) dictates that circumstantial evidence must form a complete chain leaving no reasonable doubt."
                    ],
                    "weaknesses": [
                        "Accused was last seen in proximity to the area shortly before the incident.",
                        "Initial conflicting statements given to investigators during preliminary inquiry."
                    ],
                    "opportunities": [
                        "Cross-examine the recovering officer regarding standard protocols and logging delay.",
                        "Move to exclude the weapon from evidence based on chain of custody failure."
                    ],
                    "threats": [
                        "Prosecution introducing a surprise hostile witness from the neighborhood."
                    ],
                    "recommended_strategy": "Prioritize a motion to suppress the physical weapon during pre-trial hearings. Emphasize the chain of custody gaps in the cross-examination of recovery witnesses."
                }
            },
            {
                "title": "Zenith Corp. v. Apex Logistics",
                "raw_text": "Commercial breach of contract dispute regarding delayed delivery of high-value electronic components. Zenith Corp entered into supply agreement with Apex Logistics on November 12, 2025. Apex delayed delivery of critical components by 18 days, causing an assembly line shutdown and consequential damages. Contract contains Net-30 payment terms and a disputed limitation of liability clause for consequential damages.",
                "confidence": 76,
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=4),
                "summary": {
                    "confidence_score": 76,
                    "executive_summary": "Commercial breach of contract dispute regarding delayed delivery of high-value electronic components, causing assembly line shutdown and consequential damages.",
                    "facts": [
                        "Zenith Corp entered into supply agreement with Apex Logistics on November 12, 2025.",
                        "Apex delayed delivery of critical components by 18 days.",
                        "Contract contains net-30 terms and a disputed limitation of liability clause for consequential damages."
                    ],
                    "issues": [
                        "Whether delay constitutes a material breach under Clause 14.",
                        "Whether the consequential damages waiver covers losses from factory idle time."
                    ],
                    "evidence": [
                        {"name": "Supply Agreement & SLA", "strength": 90},
                        {"name": "Email communications showing delay warnings", "strength": 85},
                        {"name": "Production downtime logs", "strength": 75}
                    ],
                    "timeline": [
                        {"date": "2025-11-12", "label": "Agreement executed by both parties"},
                        {"date": "2026-01-15", "label": "SLA delivery deadline missed by Apex"},
                        {"date": "2026-02-02", "label": "Delivery completed with 18-day delay"},
                        {"date": "2026-03-01", "label": "Notice of dispute served by Zenith"}
                    ],
                    "judgment_prediction": "Partial victory. Recovery of actual damages likely, but consequential factory idle costs might be limited by Clause 22.",
                    "recommendations": [
                        "Prepare arguments showing gross negligence to bypass the liability cap.",
                        "Attempt settlement negotiations at 70% of claim value."
                    ]
                },
                "prediction": {
                    "win_probability": 65,
                    "settlement_probability": 25,
                    "loss_probability": 10,
                    "expected_outcome_note": "Moderate to high probability of success based on contractual ambiguity and documented performance history.",
                    "evidence_strength": 70,
                    "precedent_alignment": 75,
                    "risk_level": "Low",
                    "estimated_duration": "4 - 6 months",
                    "reasoning_chain": [
                        "Ambiguity in Clause 4 (termination clauses) will likely be interpreted against the drafting party (contra proferentem).",
                        "Written email correspondence shows explicit waiver of the strict notice requirement.",
                        "Precedents strongly support the enforcement of verbal waivers backed by course of performance."
                    ],
                    "weaknesses": [
                        "Lack of formal signed amendment to the original agreement.",
                        "Minor delays in performance by our client in the initial phase."
                    ],
                    "opportunities": [
                        "Negotiate a structured settlement before trial to minimize litigation costs.",
                        "File for summary judgment on the issue of waiver."
                    ],
                    "threats": [
                        "Counterparty filing countersuits for consequential damages."
                    ],
                    "recommended_strategy": "Initiate settlement discussions highlighting the contra proferentem risk to the other party, while preparing a motion for summary judgment on the waiver issue."
                }
            },
            {
                "title": "State of New York v. Harrison",
                "raw_text": "Fourth Amendment search and seizure dispute regarding the warrantless search of a mobile phone recovered during a routine traffic stop. Defendant was pulled over for a broken taillight. Officer searched the glovebox and found defendant's phone. Warrantless digital search of messages led to incriminating evidence of contraband transactions.",
                "confidence": 92,
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=3),
                "summary": {
                    "confidence_score": 92,
                    "executive_summary": "Fourth Amendment search and seizure dispute regarding the warrantless search of a mobile phone recovered during a routine traffic stop.",
                    "facts": [
                        "Defendant was pulled over for a broken taillight.",
                        "Officer searched the glovebox and found defendant's phone.",
                        "Warrantless digital search of messages led to incriminating evidence."
                    ],
                    "issues": [
                        "Whether warrantless search of mobile phone contents incident to arrest violates the Fourth Amendment.",
                        "Whether the good-faith exception to the exclusionary rule applies."
                    ],
                    "evidence": [
                        {"name": "Incriminating text messages", "strength": 95},
                        {"name": "Dashboard camera footage", "strength": 85}
                    ],
                    "timeline": [
                        {"date": "2026-02-14", "label": "Traffic stop and warrantless search"},
                        {"date": "2026-03-10", "label": "Motion to suppress filed by defense"},
                        {"date": "2026-04-20", "label": "Suppression hearing conducted"}
                    ],
                    "judgment_prediction": "Suppression of text messages highly likely. Supreme Court precedent (Riley v. California) clearly protects digital contents of cell phones from warrantless search incident to arrest.",
                    "recommendations": [
                        "Focus on Riley v. California in all briefs.",
                        "Argue lack of exigent circumstances to justify warrantless intrusion."
                    ]
                },
                "prediction": {
                    "win_probability": 85,
                    "settlement_probability": 5,
                    "loss_probability": 10,
                    "expected_outcome_note": "Extremely high probability of evidence suppression based on settled SCOTUS precedents.",
                    "evidence_strength": 90,
                    "precedent_alignment": 95,
                    "risk_level": "Low",
                    "estimated_duration": "3 - 5 months",
                    "reasoning_chain": [
                        "Digital privacy rights are protected under Riley v. California.",
                        "No exigent circumstances or threat of evidence destruction existed at the time of the stop.",
                        "The search exceeded the permissible scope of a minor traffic infraction stop."
                    ],
                    "weaknesses": [
                        "Written consent was signed under pressure, but defense will argue it was involuntary."
                    ],
                    "opportunities": [
                        "File a motion to suppress all derivative evidence (fruit of the poisonous tree)."
                    ],
                    "threats": [
                        "Prosecution arguing inevitably discovery exception."
                    ],
                    "recommended_strategy": "File a robust motion to suppress under the Fourth Amendment, relying heavily on Riley v. California. Do not engage in plea negotiations until the suppression motion is decided."
                }
            }
        ]

        # We seed cases for ALL users so the admin user sees everything when list_cases is called,
        # but specifically associate cases to Sakshi Rathod and Lead Counsel.
        db_cases = []
        for user in db_users:
            for c_data in cases_to_seed:
                case = Case(
                    owner_id=user.id,
                    title=c_data["title"],
                    raw_text=c_data["raw_text"],
                    summary_json=json.dumps(c_data["summary"]),
                    prediction_json=json.dumps(c_data["prediction"]),
                    confidence=c_data["confidence"],
                    created_at=c_data["created_at"]
                )
                db.add(case)
                db_cases.append(case)
        db.commit()
        print(f"Seeded {len(db_cases)} cases across all users.")

        # 4. Seed Documents
        print("Seeding documents...")
        documents_to_seed = [
            {
                "title": "Meridian_NDA_Draft.txt",
                "raw_text": "Mutual Nondisclosure Agreement between Meridian Corp and InnovateLLC. Clause 8: Total liability for breach of this agreement shall not exceed $10,000. Clause 4: Confidential Information includes all disclosures made orally or in writing without marking.",
                "risk_level": "medium",
                "analysis": {
                    "overall_risk": "Medium",
                    "findings": [
                        {
                            "title": "Clause 8 — Unilateral limitation of liability for breaches",
                            "severity": "high",
                            "type": "Risky clause",
                            "detail": "The liability cap for breach of confidentiality is set to a fixed nominal amount ($10,000), which does not cover potential actual damages resulting from a major proprietary data leak."
                        },
                        {
                            "title": "Clause 4 — Definition of Confidential Information is overly broad",
                            "severity": "medium",
                            "type": "Vague terminology",
                            "detail": "The clause defines all oral and written communications as confidential without requiring them to be marked or confirmed in writing, creating compliance risks for general operational discussions."
                        }
                    ],
                    "compliance_notes": [
                        {
                            "framework": "GDPR",
                            "concern_level": "medium",
                            "note": "The definition of confidential information includes customer personal data without specifying appropriate cross-border transfer protections or standard contractual clauses (SCCs)."
                        }
                    ],
                    "suggested_redlines": [
                        {
                            "clause": "Section 8 (Limitation of Liability)",
                            "issue": "Asymmetrical damages cap for data breaches.",
                            "suggested_text": "Notwithstanding any other provision herein, neither party's liability for breach of confidentiality obligations or misuse of proprietary intellectual property under this Agreement shall be subject to the limitation of liability cap set forth in this Section."
                        }
                    ]
                }
            },
            {
                "title": "Service_Agreement_v3.txt",
                "raw_text": "Independent Contractor Service Agreement. Contractor will provide consulting services. Net-30 payment terms. Contractor retains ownership of pre-existing intellectual property, while new IP is assigned to Client upon final payment. Standard governing law of State of New York.",
                "risk_level": "low",
                "analysis": {
                    "overall_risk": "Low",
                    "findings": [
                        {
                            "title": "Clause 3 — General payment terms are standard Net-30",
                            "severity": "low",
                            "type": "Standard clause",
                            "detail": "The Net-30 payment terms are within ordinary commercial guidelines and present no unique risk to operational cash flow."
                        }
                    ],
                    "compliance_notes": [],
                    "suggested_redlines": []
                }
            },
            {
                "title": "Acquisition_Term_Sheet_Final.txt",
                "raw_text": "Acquisition Term Sheet. Clause 14: All intellectual property of the target firm shall be transferred immediately upon signing of the term sheet, regardless of final closing status. Clause 7: Either party can terminate discussions at any time with 5 days' written notice with no penalty.",
                "risk_level": "high",
                "analysis": {
                    "overall_risk": "High",
                    "findings": [
                        {
                            "title": "Clause 14 — IP assignment is immediate and unconditional",
                            "severity": "high",
                            "type": "IP ownership risk",
                            "detail": "IP of the target firm is assigned to the buyer immediately upon signing the term sheet, even if the deal fails to close, causing loss of proprietary technology."
                        },
                        {
                            "title": "Clause 7 — Termination notice period is extremely short",
                            "severity": "medium",
                            "type": "Operational risk",
                            "detail": "Allowing termination for convenience with only 5 days' written notice is substantially below the standard 30-day window and could cause sudden resource allocation disruption."
                        }
                    ],
                    "compliance_notes": [
                        {
                            "framework": "SOC 2 Type II",
                            "concern_level": "low",
                            "note": "Requires the target to undergo yearly audits but does not specify a right-to-audit cost allocation clause."
                        }
                    ],
                    "suggested_redlines": [
                        {
                            "clause": "Section 14 (Intellectual Property Assignment)",
                            "issue": "Unconditional IP transfer before payment.",
                            "suggested_text": "Subject to full payment of all undisputed fees due under the applicable SOW, Service Provider hereby assigns to Customer all right, title, and interest in and to the deliverables created hereunder."
                        }
                    ]
                }
            }
        ]

        db_docs = []
        for user in db_users:
            for doc_data in documents_to_seed:
                doc = Document(
                    owner_id=user.id,
                    title=doc_data["title"],
                    raw_text=doc_data["raw_text"],
                    analysis_json=json.dumps(doc_data["analysis"]),
                    risk_level=doc_data["risk_level"],
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
                )
                db.add(doc)
                db_docs.append(doc)
        db.commit()
        print(f"Seeded {len(db_docs)} documents across all users.")

        # 5. Seed Chat Messages
        print("Seeding chat messages...")
        chat_msgs_to_seed = [
            {"role": "assistant", "content": "Welcome to your JustiMind AI Workspace. Ask me any question about legal drafts, statutes, or precedent cases."},
            {"role": "user", "content": "Can you check what the penalties are under Section 138 of the Negotiable Instruments Act?"},
            {"role": "assistant", "content": "Under Section 138 of the Negotiable Instruments Act, a cheque bounce is a criminal offense punishable by up to two years imprisonment or a fine of up to twice the cheque amount, or both.\n\n**Procedural Essentials**:\n1. Notice must be sent within 30 days of dishonor.\n2. Drawer has 15 days to pay.\n3. Complaint must be filed within 30 days thereafter."}
        ]

        db_msgs = []
        for user in db_users:
            for idx, msg_data in enumerate(chat_msgs_to_seed):
                msg = ChatMessage(
                    owner_id=user.id,
                    role=msg_data["role"],
                    content=msg_data["content"],
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=30 - idx * 2)
                )
                db.add(msg)
                db_msgs.append(msg)
        db.commit()
        print(f"Seeded {len(db_msgs)} chat messages across all users.")
        
        print("Database successfully seeded with realistic legal dummy data!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
