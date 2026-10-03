import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  FileCheck2, 
  ExternalLink,
  Clock,
  Hash,
  Fingerprint
} from 'lucide-react';
import { apiService } from '../services/api';
import { AuditLedgerResponse, AuditIntegrity } from '../types/screening';

interface AuditLedgerViewProps {
  onSelectCase?: (caseId: string) => void;
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({ onSelectCase }) => {
  const [ledgerData, setLedgerData] = useState<AuditLedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AuditIntegrity | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAuditLedger();
      setLedgerData(data);
      setVerificationResult(data.integrity);
    } catch (err) {
      console.error('Failed to load audit ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const result = await apiService.verifyAuditLedger();
      setVerificationResult(result);
    } catch (err) {
      console.error('Failed to verify cryptographic chain:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/40 rounded-xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Output Layer — Legal Evidentiary Chain
              </span>
              <span className="text-xs text-slate-400">Cryptographic SHA-256 Hash Chaining</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Tamper-Evident Screening Audit Ledger
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Every border screening event, OCR feature extraction, forensic ELA noise metric, and officer decision is 
              hashed into an immutable block sequence. Guarantees chain of custody and full evidentiary integrity.
            </p>
          </div>

          <button
            onClick={handleVerifyChain}
            disabled={verifying || loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-md transition-all self-start md:self-auto"
          >
            <Lock className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Validating Hashes...' : 'Verify Cryptographic Chain'}
          </button>
        </div>

        {/* Live Integrity Banner */}
        {verificationResult && (
          <div className="mt-5 p-3.5 bg-slate-950/80 rounded-lg border border-emerald-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  CHAIN INTEGRITY: 100% VALIDATED
                  <span className="text-[10px] text-slate-400 font-normal">({verificationResult.total_blocks} Blocks Anchored)</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {verificationResult.message}
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Latest Root Anchor</div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                {verificationResult.latest_block_hash.substring(0, 16)}...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Stream Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            Immutable Block Sequence (Recent Events)
          </h2>
          <span className="text-xs text-slate-400">Chronological Audit Trail (Newest First)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Reading cryptographic block sequence from disk ledger...
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
            {ledgerData?.blocks.map((block, idx) => {
              const isGenesis = block.index === 0;
              const isFake = block.verdict.includes('FAKE') || block.verdict.includes('FORGED');
              const isSuspicious = block.verdict.includes('SUSPICIOUS');

              return (
                <div key={block.index} className="relative group">
                  {/* Block Node Indicator */}
                  <div className={`absolute -left-[35px] top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isGenesis 
                      ? 'bg-purple-900 border-purple-500' 
                      : isFake 
                      ? 'bg-rose-900 border-rose-500' 
                      : isSuspicious 
                      ? 'bg-amber-900 border-amber-500' 
                      : 'bg-emerald-900 border-emerald-500'
                  }`}>
                    <span className="text-[9px] font-bold text-white">{block.index}</span>
                  </div>

                  {/* Block Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition-colors">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200">
                          BLOCK #{block.index}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {block.traveler_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({block.doc_type})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                          isGenesis ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          isFake ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          isSuspicious ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {block.verdict}
                        </span>

                        {block.case_id && !isGenesis && onSelectCase && (
                          <button
                            onClick={() => onSelectCase(block.case_id)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="View full case dossier"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                      <div>
                        <div className="text-slate-400 font-medium">Evidence &amp; Forensic Trigger:</div>
                        <div className="text-slate-200 mt-1 font-sans">{block.evidence_summary}</div>
                        <div className="flex items-center gap-4 mt-2 text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> {block.timestamp}
                          </span>
                          <span className="font-mono">Officer: {block.officer_id}</span>
                        </div>
                      </div>

                      {/* Cryptographic Hash Pair */}
                      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-2 font-mono text-[11px]">
                        <div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                            <LinkIcon className="w-3 h-3 text-slate-500" /> Previous Block Hash:
                          </div>
                          <div className="text-slate-400 truncate select-all">{block.prev_hash}</div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                            <Fingerprint className="w-3 h-3 text-emerald-400" /> Evidence SHA-256 Digest:
                          </div>
                          <div className="text-emerald-400/90 truncate select-all">{block.evidence_hash}</div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-800/60">
                          <div className="text-[10px] text-emerald-400 font-sans font-semibold flex items-center gap-1">
                            <Hash className="w-3 h-3 text-emerald-400" /> Sealed Block Hash:
                          </div>
                          <div className="text-emerald-300 font-bold truncate select-all">{block.block_hash}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
