import networkx as np_nx
import networkx as nx
from typing import Dict, Any, List, Optional

class FraudGraphEngine:
    """
    Module 6 — Cross-Document Fraud-Ring Detection (AI / Graph ML — The USP)
    - Graph: nodes = submitted identities, documents, biometrics, addresses
    - Edges = shared face embedding, phone, address across submissions
    - Louvain community detection (NetworkX) surfaces clusters of connected fake identities
    """

    def __init__(self):
        self.G = nx.Graph()
        self._build_seed_graph()

    def _build_seed_graph(self):
        """Construct the seeded border screening graph with known multi-document clusters."""
        self.G.clear()

        # Nodes: Identities
        self.G.add_node("ID:Rahul Sharma", label="Rahul Sharma", type="identity", risk="high", case_id="VD-10241")
        self.G.add_node("ID:Rajesh Kumar", label="Rajesh Kumar", type="identity", risk="high", case_id="VD-10192")
        self.G.add_node("ID:Suresh Verma", label="Suresh Verma", type="identity", risk="high", case_id="VD-10188")
        self.G.add_node("ID:Amit Patel", label="Amit Patel", type="identity", risk="medium", case_id="VD-10240")
        self.G.add_node("ID:Priya Nair", label="Priya Nair", type="identity", risk="low", case_id="VD-10242")
        self.G.add_node("ID:John Smith", label="John Smith", type="identity", risk="medium", case_id="VD-10029")

        # Nodes: Documents
        self.G.add_node("DOC:P1234567", label="Passport P1234567", type="document", subtype="passport")
        self.G.add_node("DOC:P8812904", label="Passport P8812904", type="document", subtype="passport")
        self.G.add_node("DOC:AADHAAR-4921", label="Aadhaar ****-4921", type="document", subtype="aadhaar")
        self.G.add_node("DOC:AADHAAR-9902", label="Aadhaar ****-9902", type="document", subtype="aadhaar")
        self.G.add_node("DOC:PAN-ABCDE1234F", label="PAN ABCDE1234F", type="document", subtype="pan")
        self.G.add_node("DOC:P8892104", label="Passport P8892104", type="document", subtype="passport")
        self.G.add_node("DOC:VISA-MRVA-102", label="Visa MRV-A 102", type="document", subtype="visa")

        # Nodes: Shared Biometric Face Vectors
        self.G.add_node("BIO:Face-Vector-Alpha", label="128D Face Vector #FA91", type="biometric", notes="Shared biometric face vector")
        self.G.add_node("BIO:Face-Vector-Beta", label="128D Face Vector #CB14", type="biometric", notes="Unique face vector")
        self.G.add_node("BIO:Face-Vector-Gamma", label="128D Face Vector #DD82", type="biometric", notes="Unique face vector")

        # Nodes: Shared Attributes (Address, Phone)
        self.G.add_node("ATTR:Addr-Rohini", label="Sector 14, Rohini, New Delhi", type="address")
        self.G.add_node("ATTR:Phone-98110", label="+91-98110-XXXXX", type="phone")

        # Edges forming Fraud Syndicate 1 (Organized Identity Theft / Ghost Identity Ring)
        # Rahul Sharma, Rajesh Kumar, and Suresh Verma share the SAME FACE VECTOR and address!
        self.G.add_edge("ID:Rahul Sharma", "DOC:P1234567", relation="PRESENTED_DOC")
        self.G.add_edge("ID:Rahul Sharma", "DOC:AADHAAR-4921", relation="PRESENTED_DOC")
        self.G.add_edge("ID:Rahul Sharma", "BIO:Face-Vector-Alpha", relation="BIOMETRIC_MATCH")
        self.G.add_edge("ID:Rahul Sharma", "ATTR:Addr-Rohini", relation="REGISTERED_ADDRESS")

        self.G.add_edge("ID:Rajesh Kumar", "DOC:P8812904", relation="PRESENTED_DOC")
        self.G.add_edge("ID:Rajesh Kumar", "BIO:Face-Vector-Alpha", relation="BIOMETRIC_MATCH")  # <--- CRITICAL FRAUD LINK
        self.G.add_edge("ID:Rajesh Kumar", "ATTR:Addr-Rohini", relation="REGISTERED_ADDRESS")

        self.G.add_edge("ID:Suresh Verma", "DOC:AADHAAR-9902", relation="PRESENTED_DOC")
        self.G.add_edge("ID:Suresh Verma", "DOC:PAN-ABCDE1234F", relation="PRESENTED_DOC")
        self.G.add_edge("ID:Suresh Verma", "BIO:Face-Vector-Alpha", relation="BIOMETRIC_MATCH")  # <--- CRITICAL FRAUD LINK
        self.G.add_edge("ID:Suresh Verma", "ATTR:Phone-98110", relation="CONTACT_NUMBER")

        # Edges for Amit Patel (Medium risk case)
        self.G.add_edge("ID:Amit Patel", "DOC:VISA-MRVA-102", relation="PRESENTED_DOC")
        self.G.add_edge("ID:Amit Patel", "BIO:Face-Vector-Beta", relation="BIOMETRIC_MATCH")

        # Edges for Priya Nair (Genuine / clean case - isolated community)
        self.G.add_edge("ID:Priya Nair", "DOC:P8892104", relation="PRESENTED_DOC")
        self.G.add_edge("ID:Priya Nair", "BIO:Face-Vector-Gamma", relation="BIOMETRIC_MATCH")

    def add_custom_screening_node(self, case_id: str, traveler_name: str, doc_number: str, doc_type: str, face_match_target: Optional[str] = None):
        """Dynamically link a newly screened traveler into the graph."""
        id_node = f"ID:{traveler_name}"
        doc_node = f"DOC:{doc_number}"
        self.G.add_node(id_node, label=traveler_name, type="identity", risk="custom", case_id=case_id)
        self.G.add_node(doc_node, label=f"{doc_type} {doc_number}", type="document", subtype=doc_type.lower())
        self.G.add_edge(id_node, doc_node, relation="PRESENTED_DOC")

        if face_match_target:
            self.G.add_edge(id_node, face_match_target, relation="BIOMETRIC_MATCH")

    def detect_communities(self) -> List[Dict[str, Any]]:
        """Run Louvain community detection to surface organized multi-document fraud rings."""
        try:
            communities_gen = nx.community.louvain_communities(self.G, seed=42)
        except Exception:
            # Fallback to greedy modularity communities
            communities_gen = nx.community.greedy_modularity_communities(self.G)

        syndicate_reports = []
        for idx, comm in enumerate(communities_gen):
            comm_nodes = list(comm)
            identities = [n for n in comm_nodes if self.G.nodes[n].get('type') == 'identity']
            documents = [n for n in comm_nodes if self.G.nodes[n].get('type') == 'document']
            biometrics = [n for n in comm_nodes if self.G.nodes[n].get('type') == 'biometric']

            is_syndicate = len(identities) > 1 and len(biometrics) >= 1
            risk_level = "CRITICAL" if is_syndicate else ("MEDIUM" if len(documents) > 2 else "LOW")

            syndicate_reports.append({
                "community_id": f"COMM-0{idx+1}",
                "name": f"Syndicate Cluster {chr(65+idx)}" if is_syndicate else f"Verified Entity Group {chr(65+idx)}",
                "node_count": len(comm_nodes),
                "nodes": comm_nodes,
                "identities": [self.G.nodes[i].get('label') for i in identities],
                "documents": [self.G.nodes[d].get('label') for d in documents],
                "is_fraud_syndicate": is_syndicate,
                "risk_level": risk_level,
                "description": f"Organized fraud ring detected: {len(identities)} distinct legal identities linked via shared facial biometrics & addresses." if is_syndicate else "Isolated genuine credential cluster with 1:1 identity-to-document mapping."
            })

        # Sort with fraud syndicates first
        syndicate_reports.sort(key=lambda x: 0 if x["is_fraud_syndicate"] else 1)
        return syndicate_reports

    def get_graph_data(self) -> Dict[str, Any]:
        """Serialize graph into D3 / SVG compatible node-link schema."""
        communities = self.detect_communities()
        node_comm_map = {}
        for c in communities:
            for n in c["nodes"]:
                node_comm_map[n] = c["community_id"]

        nodes = []
        for n, d in self.G.nodes(data=True):
            nodes.append({
                "id": n,
                "label": d.get("label", n),
                "type": d.get("type", "unknown"),
                "risk": d.get("risk", "low"),
                "subtype": d.get("subtype", ""),
                "case_id": d.get("case_id", ""),
                "community": node_comm_map.get(n, "COMM-01")
            })

        links = []
        for u, v, d in self.G.edges(data=True):
            links.append({
                "source": u,
                "target": v,
                "relation": d.get("relation", "LINKED")
            })

        return {
            "nodes": nodes,
            "links": links,
            "communities": communities,
            "total_identities": len([n for n in nodes if n["type"] == "identity"]),
            "total_documents": len([n for n in nodes if n["type"] == "document"]),
            "fraud_rings_detected": len([c for c in communities if c["is_fraud_syndicate"]]),
            "methodology": "NetworkX Louvain Modular Community Detection + Bipartite Link Analysis"
        }
