import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavigationPage } from './components/Sidebar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { NewScreening } from './components/NewScreening';
import { ScreeningAnalysis } from './components/ScreeningAnalysis';
import { ScreeningResult } from './components/ScreeningResult';
import { ScreeningHistory } from './components/ScreeningHistory';
import { CaseDetails } from './components/CaseDetails';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TestingCenter } from './components/TestingCenter';
import { ReportModal } from './components/ReportModal';
import { ReviewModal } from './components/ReviewModal';
import { FraudGraphView } from './components/FraudGraphView';
import { AuditLedgerView } from './components/AuditLedgerView';

export type AppPage =
  | 'login'
  | 'dashboard'
  | 'new-screening'
  | 'fraud-graph'
  | 'audit-ledger'
  | 'screening-analysis'
  | 'screening-result'
  | 'history'
  | 'case-details'
  | 'alerts'
  | 'reports'
  | 'settings'
  | 'testing';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [activeCaseId, setActiveCaseId] = useState<string>('VD-10241');
  const [reportModalCaseId, setReportModalCaseId] = useState<string | null>(null);
  const [reviewModalCaseId, setReviewModalCaseId] = useState<string | null>(null);
  const [liveCases, setLiveCases] = useState<Record<string, any>>({});

  // Authentication handlers
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const [activeCustomInput, setActiveCustomInput] = useState<any>(null);

  // Screening workflow progression
  const handleStartAnalysis = (caseId: string, customInput?: any) => {
    setActiveCaseId(caseId);
    setActiveCustomInput(customInput || null);
    setCurrentPage('screening-analysis');
  };

  const handleAnalysisComplete = (liveResult?: any) => {
    if (liveResult && liveResult.id) {
      const targetId = liveResult.id;
      setActiveCaseId(targetId);
      setLiveCases((prev) => ({
        ...prev,
        [targetId]: liveResult,
        [activeCaseId]: liveResult,
        'VD-CUSTOM': liveResult,
      }));
    } else if (liveResult) {
      setLiveCases((prev) => ({
        ...prev,
        [activeCaseId]: liveResult,
        'VD-CUSTOM': liveResult,
      }));
    }
    setCurrentPage('screening-result');
  };

  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    // If selecting from history or recent table, open result or details
    setCurrentPage('screening-result');
  };

  const handleOpenCaseDetails = (caseId: string) => {
    setActiveCaseId(caseId);
    setCurrentPage('case-details');
  };

  // If not logged in, render the Login screen
  if (!isAuthenticated || currentPage === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header onLogout={handleLogout} />

      {/* Main Body with Sidebar + Workspace View */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPage={
            currentPage === 'screening-result' || currentPage === 'case-details' || currentPage === 'screening-analysis'
              ? 'new-screening'
              : (currentPage as NavigationPage)
          }
          onNavigate={(page) => setCurrentPage(page as AppPage)}
          onLogout={handleLogout}
          flaggedCount={32}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-16">
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={(page) => setCurrentPage(page as AppPage)}
              onSelectCase={handleSelectCase}
            />
          )}

          {currentPage === 'new-screening' && (
            <NewScreening onStartAnalysis={handleStartAnalysis} />
          )}

          {currentPage === 'fraud-graph' && (
            <FraudGraphView onSelectCase={handleSelectCase} />
          )}

          {currentPage === 'audit-ledger' && (
            <AuditLedgerView onSelectCase={handleSelectCase} />
          )}

          {currentPage === 'screening-analysis' && (
            <ScreeningAnalysis
              caseId={activeCaseId}
              customInput={activeCustomInput}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {currentPage === 'screening-result' && (
            <ScreeningResult
              caseId={activeCaseId}
              onNavigate={(page) => setCurrentPage(page as AppPage)}
              onSelectCase={(id) => setActiveCaseId(id)}
              onOpenReportModal={(id) => setReportModalCaseId(id)}
              onOpenReviewModal={(id) => setReviewModalCaseId(id)}
              liveResult={liveCases[activeCaseId] || liveCases['VD-CUSTOM']}
            />
          )}

          {currentPage === 'history' && (
            <ScreeningHistory onSelectCase={handleOpenCaseDetails} />
          )}

          {currentPage === 'case-details' && (
            <CaseDetails
              caseId={activeCaseId}
              onBack={() => setCurrentPage('history')}
              onOpenReportModal={(id) => setReportModalCaseId(id)}
              liveResult={liveCases[activeCaseId] || liveCases['VD-CUSTOM']}
            />
          )}

          {currentPage === 'alerts' && (
            <AlertsView onSelectCase={handleSelectCase} />
          )}

          {currentPage === 'reports' && <ReportsView />}

          {currentPage === 'settings' && <SettingsView />}

          {currentPage === 'testing' && <TestingCenter />}
        </main>
      </div>

      {/* Modals */}
      {reportModalCaseId && (
        <ReportModal
          caseId={reportModalCaseId}
          isOpen={!!reportModalCaseId}
          onClose={() => setReportModalCaseId(null)}
        />
      )}

      {reviewModalCaseId && (
        <ReviewModal
          caseId={reviewModalCaseId}
          isOpen={!!reviewModalCaseId}
          onClose={() => setReviewModalCaseId(null)}
        />
      )}
    </div>
  );
}

export default App;
