import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  FileCheck2,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { RECENT_SCREENINGS } from '../mock/cases';
import { RiskLevel } from '../types/screening';

interface ScreeningHistoryProps {
  onSelectCase: (caseId: string) => void;
}

export const ScreeningHistory: React.FC<ScreeningHistoryProps> = ({ onSelectCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [docFilter, setDocFilter] = useState<'all' | string>('all');

  const filteredCases = RECENT_SCREENINGS.filter((item) => {
    const matchesSearch =
      item.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.document.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'all' || item.riskLevel === riskFilter;
    const matchesDoc = docFilter === 'all' || item.document.toLowerCase() === docFilter.toLowerCase();

    return matchesSearch && matchesRisk && matchesDoc;
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Audit & Verification Archive</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Screening History & Case Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Immutable log of all screened passenger documents, risk assessments, and forensic inspections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting full audit trail to CSV format...')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between shadow-sm">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Person name, Case ID, or Document..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Risk Levels</option>
              <option value="high" className="bg-slate-900 text-rose-400">High Risk (50)</option>
              <option value="medium" className="bg-slate-900 text-amber-400">Medium Risk (96)</option>
              <option value="low" className="bg-slate-900 text-emerald-400">Low Risk (1,102)</option>
            </select>
          </div>

          {/* Document Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-slate-400">Doc:</span>
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Documents</option>
              <option value="passport" className="bg-slate-900 text-slate-200">Passport</option>
              <option value="visa" className="bg-slate-900 text-slate-200">Visa</option>
              <option value="national id" className="bg-slate-900 text-slate-200">National ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Case ID</th>
                <th className="py-3.5 px-4 font-semibold">Person</th>
                <th className="py-3.5 px-4 font-semibold">Document</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Risk Score</th>
                <th className="py-3.5 px-4 font-semibold">Risk Level</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {filteredCases.length > 0 ? (
                filteredCases.map((row) => {
                  const isHigh = row.riskLevel === 'high';
                  const isMedium = row.riskLevel === 'medium';
                  const isLow = row.riskLevel === 'low';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onSelectCase(row.id)}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      {/* Case ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {row.id}
                      </td>

                      {/* Person */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {row.person}
                      </td>

                      {/* Document */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                          {row.document}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">
                        {row.date} {row.time}
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isHigh ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {row.riskScore}/100
                        </span>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                            isHigh
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                              : isMedium
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isHigh ? 'bg-rose-400 animate-pulse' : isMedium ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                          />
                          {row.riskLevel.toUpperCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        {row.status}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(row.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                            isHigh
                              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50'
                              : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs font-mono">
                    No matching screening cases found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <span>Showing {filteredCases.length} of 1,248 total screened cases</span>
          <span>Security Station: Terminal 3 Alpha</span>
        </div>
      </div>
    </div>
  );
};
