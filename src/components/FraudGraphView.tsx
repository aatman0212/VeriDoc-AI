import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  ShieldAlert, 
  Users, 
  FileText, 
  Fingerprint, 
  Share2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  ExternalLink,
  Layers
} from 'lucide-react';
import { apiService } from '../services/api';
import { FraudGraphData, FraudGraphNode, FraudCommunity } from '../types/screening';

interface FraudGraphViewProps {
  onSelectCase?: (caseId: string) => void;
}

export const FraudGraphView: React.FC<FraudGraphViewProps> = ({ onSelectCase }) => {
  const [graphData, setGraphData] = useState<FraudGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<FraudGraphNode | null>(null);
  const [activeCommunity, setActiveCommunity] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await apiService.getFraudGraph();
      setGraphData(data);
      // Select the primary suspect by default if available
      const suspect = data.nodes.find(n => n.id === 'ID:Rahul Sharma') || data.nodes[0];
      setSelectedNode(suspect || null);
    } catch (err) {
      console.error('Failed to load fraud graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes.filter(node => {
      const matchesComm = activeCommunity === 'all' || node.community === activeCommunity;
      const matchesSearch = !searchTerm || 
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        node.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesComm && matchesSearch;
    });
  }, [graphData, activeCommunity, searchTerm]);

  // Compute fixed SVG coordinates for aesthetic graph rendering
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    if (!graphData) return map;

    // Cluster centers by community
    const centers: Record<string, { cx: number; cy: number }> = {
      'COMM-01': { cx: 240, cy: 220 }, // Syndicate Alpha
      'COMM-02': { cx: 560, cy: 180 }, // Cluster Beta
      'COMM-03': { cx: 480, cy: 380 }, // Cluster Gamma
      'COMM-04': { cx: 720, cy: 340 }, // Cluster Delta
      'COMM-05': { cx: 160, cy: 400 }, // Other
    };

    const commCounts: Record<string, number> = {};

    graphData.nodes.forEach((node) => {
      const comm = node.community || 'COMM-01';
      const center = centers[comm] || { cx: 400, cy: 250 };
      const idx = commCounts[comm] || 0;
      commCounts[comm] = idx + 1;

      // Layout in a small circle around the community center
      const angle = (idx * 2 * Math.PI) / 6;
      const radius = node.type === 'identity' ? 25 : node.type === 'biometric' ? 85 : 120;
      const x = center.cx + radius * Math.cos(angle);
      const y = center.cy + radius * Math.sin(angle);
      map.set(node.id, { x: Math.max(50, Math.min(750, x)), y: Math.max(50, Math.min(450, y)) });
    });

    return map;
  }, [graphData]);

  // Connected links for selected node
  const connectedLinks = useMemo(() => {
    if (!graphData || !selectedNode) return [];
    return graphData.links.filter(
      l => l.source === selectedNode.id || l.target === selectedNode.id
    );
  }, [graphData, selectedNode]);

  // Connected node ids
  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (selectedNode) set.add(selectedNode.id);
    connectedLinks.forEach(l => {
      set.add(l.source);
      set.add(l.target);
    });
    return set;
  }, [selectedNode, connectedLinks]);

  const getNodeColor = (node: FraudGraphNode) => {
    if (node.type === 'identity') {
      return node.risk === 'high' ? '#ef4444' : node.risk === 'medium' ? '#f59e0b' : '#3b82f6';
    }
    if (node.type === 'biometric') return '#a855f7'; // Purple for face vectors
    if (node.type === 'document') return '#06b6d4'; // Cyan for credentials
    if (node.type === 'address') return '#10b981'; // Emerald for address
    return '#ec4899'; // Pink for phone
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / USP Highlight */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-800/40 rounded-xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Network className="w-3.5 h-3.5" /> Module 6 — Key Project USP
              </span>
              <span className="text-xs text-slate-400">NetworkX &amp; Louvain Modularity Community Analytics</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Cross-Document Fraud-Ring Detection
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Surfaces organized identity fraud syndicates by linking disparate traveler encounters through shared 
              128D biometric face embeddings, duplicate document numbers, and synthetic residential attributes.
            </p>
          </div>

          <button
            onClick={loadGraph}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-md transition-all self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Topology
          </button>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-purple-800/30">
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Identities Mapped</div>
            <div className="text-xl font-bold text-white mt-0.5">{graphData?.total_identities || 6}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <Users className="w-3 h-3" /> Live Checkpoint Vault
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Credentials Linked</div>
            <div className="text-xl font-bold text-cyan-400 mt-0.5">{graphData?.total_documents || 7}</div>
            <div className="text-[11px] text-cyan-300/80 flex items-center gap-1 mt-1">
              <FileText className="w-3 h-3" /> Passports, Aadhaar, PAN
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Biometric Face Clones</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{graphData?.cross_identity_clones_detected || 3}</div>
            <div className="text-[11px] text-rose-300/80 flex items-center gap-1 mt-1">
              <Fingerprint className="w-3 h-3" /> Serial Vector Re-use
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Louvain Communities</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{graphData?.communities?.length || 3}</div>
            <div className="text-[11px] text-purple-300/80 flex items-center gap-1 mt-1">
              <Layers className="w-3 h-3" /> Syndicates Clustered
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Graph Visualizer + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg">
          {/* Graph Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Filter Syndicate:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveCommunity('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeCommunity === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                {graphData?.communities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCommunity(c.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeCommunity === c.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.name.split(' ')[0]} ({c.id})
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search node or doc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-44"
              />
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative flex-1 min-h-[460px] bg-slate-950/70 rounded-lg mt-3 overflow-hidden border border-slate-800/60 flex items-center justify-center">
            {/* Legend */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-300 space-y-1.5 z-10">
              <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Entity Legend</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High-Risk Identity</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Standard Identity</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Biometric Face Vector</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Document Credential</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Address Attribute</div>
            </div>

            <svg viewBox="0 0 800 500" className="w-full h-full select-none">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
                </marker>
              </defs>

              {/* Draw Edges */}
              {graphData?.links.map((link, i) => {
                const sPos = nodePositions.get(link.source);
                const tPos = nodePositions.get(link.target);
                if (!sPos || !tPos) return null;

                const isConnected = selectedNode && (link.source === selectedNode.id || link.target === selectedNode.id);
                const isFaded = selectedNode && !isConnected;

                return (
                  <g key={`edge-${i}`} className="transition-opacity duration-300">
                    <line
                      x1={sPos.x}
                      y1={sPos.y}
                      x2={tPos.x}
                      y2={tPos.y}
                      stroke={isConnected ? '#c084fc' : '#334155'}
                      strokeWidth={isConnected ? 2.5 : 1.2}
                      strokeDasharray={link.relation.includes('DUPLICATE') ? '4 3' : 'none'}
                      opacity={isFaded ? 0.2 : 0.85}
                    />
                    {/* Edge Label for Highlighted Connection */}
                    {isConnected && (
                      <text
                        x={(sPos.x + tPos.x) / 2}
                        y={(sPos.y + tPos.y) / 2 - 4}
                        fill="#e9d5ff"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                        className="bg-slate-900"
                      >
                        {link.relation}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {graphData?.nodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;

                const isSelected = selectedNode?.id === node.id;
                const isNeighbor = connectedNodeIds.has(node.id);
                const isFaded = selectedNode && !isNeighbor;
                const isFiltered = !filteredNodes.some(n => n.id === node.id);

                if (isFiltered) return null;

                const nodeColor = getNodeColor(node);
                const radius = node.type === 'identity' ? 18 : node.type === 'biometric' ? 15 : 12;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-all duration-200"
                    opacity={isFaded ? 0.25 : 1}
                  >
                    {/* Ripple / Halo on selected */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 7}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin origin-center"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={nodeColor}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="hover:scale-110 transition-transform"
                    />

                    {/* Node Text Label */}
                    <text
                      x={pos.x}
                      y={pos.y + radius + 12}
                      fill={isSelected ? '#ffffff' : '#94a3b8'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow"
                    >
                      {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Tip: Click on any entity node to inspect cross-credential linkages and biometric matches.</span>
            <span>Louvain Modular Resolution: 1.0</span>
          </div>
        </div>

        {/* Right Col: Selected Entity & Syndicate Cards */}
        <div className="space-y-4">
          {/* Selected Node Details Card */}
          {selectedNode ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Inspecting Entity
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded uppercase ${
                  selectedNode.risk === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  selectedNode.risk === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {selectedNode.risk} Risk
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mt-2 flex items-center gap-2">
                {selectedNode.type === 'identity' && <Users className="w-5 h-5 text-blue-400" />}
                {selectedNode.type === 'biometric' && <Fingerprint className="w-5 h-5 text-purple-400" />}
                {selectedNode.type === 'document' && <FileText className="w-5 h-5 text-cyan-400" />}
                {selectedNode.label}
              </h2>

              <div className="text-xs text-slate-400 mt-1 font-mono">{selectedNode.id}</div>

              {selectedNode.case_id && (
                <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">Tied Screening Case</div>
                    <div className="text-xs font-bold text-purple-300">{selectedNode.case_id}</div>
                  </div>
                  {onSelectCase && (
                    <button
                      onClick={() => onSelectCase(selectedNode.case_id!)}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs flex items-center gap-1 font-medium transition-colors"
                    >
                      Inspect Dossier <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Connected Links Summary */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  Linked Attributes ({connectedLinks.length})
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {connectedLinks.map((l, i) => {
                    const otherId = l.source === selectedNode.id ? l.target : l.source;
                    const otherNode = graphData?.nodes.find(n => n.id === otherId);
                    const isSerialDuplicate = l.relation.includes('DUPLICATE');

                    return (
                      <div
                        key={i}
                        onClick={() => otherNode && setSelectedNode(otherNode)}
                        className={`p-2 rounded-lg text-xs border cursor-pointer transition-colors ${
                          isSerialDuplicate
                            ? 'bg-rose-950/40 border-rose-800/60 hover:bg-rose-900/50'
                            : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{otherNode?.label || otherId}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSerialDuplicate ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {l.relation}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 capitalize">
                          Type: {otherNode?.type || 'Attribute'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-sm">
              Select a node in the graph to inspect forensic linkages.
            </div>
          )}

          {/* Louvain Fraud Syndicate Clusters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Detected Fraud Syndicates ({graphData?.communities.length || 0})
            </h3>

            <div className="space-y-2.5">
              {graphData?.communities.map((comm) => (
                <div
                  key={comm.id}
                  onClick={() => {
                    setActiveCommunity(comm.id);
                    const firstMember = graphData.nodes.find(n => n.community === comm.id);
                    if (firstMember) setSelectedNode(firstMember);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeCommunity === comm.id
                      ? 'bg-purple-950/50 border-purple-600/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{comm.name}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                      comm.risk === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      comm.risk === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {comm.risk}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {comm.description}
                  </p>
                  <div className="text-[10px] text-purple-300/80 font-medium mt-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {comm.members_count} Linked Entities in Ring
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
