import numpy as np
from typing import Dict, Any, List, Optional

class BiometricVault:
    """
    Module 4 — Face Matching & Duplicate Identity (AI/ML — pretrained)
    - Face detection & 128D embedding simulation (ArcFace / FaceNet)
    - 1:1 match: document portrait vs live checkpoint selfie
    - 1:N search via FAISS / vector vault: flags if this face already exists under a different identity
    """

    def __init__(self):
        # Seeded historical vault of previously screened / watchlist face embeddings
        # This simulates a 1:N biometric deduplication database (FAISS / Milvus)
        self.enrolled_faces = [
            {
                "case_id": "VD-10192",
                "registered_name": "Rajesh Kumar",
                "registered_doc": "P8812904",
                "nationality": "IND",
                "embedding_seed": 42,
                "notes": "Flagged for fraudulent visa presentation at Delhi T3 (2026-08-14)"
            },
            {
                "case_id": "VD-10044",
                "registered_name": "Carlos Gomez",
                "registered_doc": "E4921004",
                "nationality": "ESP",
                "embedding_seed": 108,
                "notes": "Overstay watch alert"
            },
            {
                "case_id": "VD-10088",
                "registered_name": "Tariq Mansoor",
                "registered_doc": "K1928374",
                "nationality": "UAE",
                "embedding_seed": 77,
                "notes": "Identity theft suspect"
            }
        ]

    def generate_embedding(self, seed: int = 0) -> np.ndarray:
        """Generate normalized 128-dimensional biometric embedding."""
        rng = np.random.RandomState(seed)
        vec = rng.randn(128)
        norm = np.linalg.norm(vec)
        return vec / (norm + 1e-7)

    def cosine_similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        """Compute cosine similarity between two feature vectors."""
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-7))

    def verify_1_to_1(self, mock_scenario: str = "match") -> Dict[str, Any]:
        """Perform 1:1 facial verification between document photo and live selfie."""
        if mock_scenario == "mismatch":
            v1 = self.generate_embedding(seed=12)
            v2 = self.generate_embedding(seed=99)
            sim = 42.6
        elif mock_scenario == "borderline":
            v1 = self.generate_embedding(seed=15)
            v2 = v1 + np.random.RandomState(22).randn(128) * 0.4
            v2 = v2 / np.linalg.norm(v2)
            sim = 68.4
        else:
            v1 = self.generate_embedding(seed=50)
            v2 = v1 + np.random.RandomState(50).randn(128) * 0.05
            v2 = v2 / np.linalg.norm(v2)
            sim = 98.2

        is_match = sim >= 75.0
        is_borderline = 60.0 <= sim < 75.0

        return {
            "similarity_score": round(sim, 1),
            "is_match": is_match,
            "is_borderline": is_borderline,
            "threshold": 75.0,
            "metric": "Cosine Distance",
            "liveness": "CONFIRMED (3D Depth & Micro-Eye-Blink)",
            "verdict": "CONFIRMED_MATCH" if is_match else ("BORDERLINE_REVIEW" if is_borderline else "IMPERSONATION_ALERT")
        }

    def search_1_to_n_duplicates(self, traveler_name: str, document_number: str, mock_trigger_duplicate: bool = False) -> Dict[str, Any]:
        """
        1:N Vector Search (FAISS simulation):
        Searches historical database to detect if this face vector was used under a different name or doc number.
        """
        if mock_trigger_duplicate or document_number == "P1234567":
            # Trigger duplicate detection against Rajesh Kumar (Preset Case VD-10241)
            matched_record = self.enrolled_faces[0]
            sim = 93.4
            return {
                "duplicate_detected": True,
                "confidence": sim,
                "matched_record": matched_record,
                "reason": f"DUPLICATE FACE ALERT: Same 128D biometric vector was observed in Case {matched_record['case_id']} registered under name '{matched_record['registered_name']}' (Doc: {matched_record['registered_doc']})",
                "severity": "CRITICAL"
            }

        return {
            "duplicate_detected": False,
            "confidence": 0.0,
            "matched_record": None,
            "reason": "Zero duplicate facial identities detected across historical biometric repository (1:N search clear)",
            "severity": "LOW"
        }
