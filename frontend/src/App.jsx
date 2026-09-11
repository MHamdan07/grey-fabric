import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PageContainer } from './components/layout/PageContainer';
import { Dashboard } from './pages/Dashboard';
import { NewCosting } from './pages/NewCosting';
import { CostingHistory } from './pages/CostingHistory';
import { CostingDetails } from './pages/CostingDetails';
import { CostingComparison } from './pages/CostingComparison';
import { YarnToFabric } from './pages/YarnToFabric';
import { FabricToYarn } from './pages/FabricToYarn';
import { ProductionPlans } from './pages/ProductionPlans';
import { ProductionReports } from './pages/ProductionReports';
import { YarnMaster } from './pages/YarnMaster';
import { FabricMaster } from './pages/FabricMaster';
import { ChargesManagement } from './pages/ChargesManagement';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ExportCenter } from './pages/ExportCenter';
import { ExportModal } from './components/export/ExportModal';
import { reportService } from './services/mastersService';
import { costingService } from './services/costingService';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCostingId, setActiveCostingId] = useState(null);
  const [prefilledCostingData, setPrefilledCostingData] = useState(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-gray-400 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-brand border-t-transparent rounded-full animate-spin" />
          <span>Starting Grey Costing Engine...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleNavigate = (tab, payload = null) => {
    if (tab === 'costing-details' && payload) {
      setActiveCostingId(payload);
      setActiveTab('costing-details');
    } else if (tab === 'new-costing') {
      setPrefilledCostingData(payload || null);
      setActiveTab('new-costing');
    } else {
      setActiveTab(tab);
    }
  };

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDuplicateFromDetails = async (id) => {
    try {
      const res = await costingService.duplicate(id);
      if (res?.success) {
        addToast(`Costing duplicated: ${res.data.costing_id}`, 'success');
        setActiveCostingId(res.data.id);
        setActiveTab('costing-details');
      }
    } catch (err) {
      addToast('Failed to duplicate: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Grey Fabric Costing Dashboard', subtitle: 'Real-time fabric manufacturing analytics and cost trends' };
      case 'new-costing':
        return {
          title: prefilledCostingData?.id ? 'Edit Grey Fabric Costing' : 'New Grey Fabric Costing',
          subtitle: 'Live textile calculation engine with count normalization and audit breakdown'
        };
      case 'costing-history':
        return { title: 'Costing History Ledger', subtitle: 'Historical database of calculated grey fabric specifications' };
      case 'costing-details':
        return { title: 'Costing Technical Sheet', subtitle: 'Detailed yarn weight and process charge breakdown' };
      case 'comparison':
        return { title: 'Specification Comparison', subtitle: 'Evaluate multiple grey fabric constructions side-by-side' };
      case 'yarn-to-fabric':
        return {
          title: 'Yarn → Fabric Production Planner',
          subtitle: 'Determine exact fabric meters, balanced yarn limits, and surplus thread buffers (Rs. 10 Lakh Calculator)'
        };
      case 'fabric-to-yarn':
        return {
          title: 'Fabric → Yarn Requirement Planner',
          subtitle: 'Reverse production planning for target order meters and procurement budgeting'
        };
      case 'production-plans':
        return { title: 'Production Planning Ledger', subtitle: 'Archived factory production batches, meter yields, and thread balances' };
      case 'production-reports':
        return { title: 'Production & Utilization Reports', subtitle: 'Aggregate factory yields, process allowances, and yarn utilization analytics' };
      case 'yarn-master':
        return { title: 'Yarn Master Data', subtitle: 'Spinning counts and yarn rates per kg' };
      case 'fabric-master':
        return { title: 'Fabric Master Library', subtitle: 'Standard fabric article library and construction specifications' };
      case 'charges':
        return { title: 'Process Charges Management', subtitle: 'Warping, sizing, weaving, and auxiliary unit tariffs' };
      case 'reports':
        return { title: 'Costing Reports & Analysis', subtitle: 'Aggregated analytics and ledger exports' };
      case 'users':
        return { title: 'User Management', subtitle: 'System users and role access controls' };
      case 'export':
        return { title: 'Export Data Center', subtitle: 'Secure backend-driven enterprise reports and master catalog workbooks' };
      case 'settings':
        return { title: 'Engine Configuration', subtitle: 'Textile constant Ne 1693.35, count systems, and system status' };
      default:
        return { title: 'Grey Fabric Costing', subtitle: 'Textile Manufacturing Cost Engine' };
    }
  };

  const pageMeta = getPageTitle();

  return (
    <div className="min-h-screen bg-dark-bg text-white flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          onNewCosting={() => handleNavigate('new-costing')}
          onExport={() => setIsExportModalOpen(true)}
          onRefresh={handleRefresh}
          selectedDays={selectedDays}
          onDateRangeChange={(days) => setSelectedDays(days)}
        />

        <main className="flex-1 overflow-y-auto">
          <PageContainer>
            {activeTab === 'dashboard' && (
              <Dashboard
                key={`dash-${refreshKey}-${selectedDays}`}
                onNavigate={handleNavigate}
                selectedDays={selectedDays}
              />
            )}
            {activeTab === 'new-costing' && (
              <NewCosting
                key={`new-${prefilledCostingData?.id || 'fresh'}`}
                initialData={prefilledCostingData}
                onSaved={(saved) => handleNavigate('costing-details', saved.id)}
              />
            )}
            {activeTab === 'costing-history' && (
              <CostingHistory
                key={`hist-${refreshKey}`}
                onNavigate={handleNavigate}
              />
            )}
            {activeTab === 'costing-details' && (
              <CostingDetails
                key={`details-${activeCostingId}-${refreshKey}`}
                costingId={activeCostingId}
                onBack={() => handleNavigate('costing-history')}
                onDuplicate={handleDuplicateFromDetails}
                onEdit={(costing) => handleNavigate('new-costing', costing)}
              />
            )}
            {activeTab === 'comparison' && (
              <CostingComparison
                key={`compare-${refreshKey}`}
                onNavigate={handleNavigate}
              />
            )}

            {/* Production Planning Modes */}
            {activeTab === 'yarn-to-fabric' && (
              <YarnToFabric
                key={`y2f-${refreshKey}`}
                onNavigate={handleNavigate}
              />
            )}
            {activeTab === 'fabric-to-yarn' && (
              <FabricToYarn
                key={`f2y-${refreshKey}`}
                onNavigate={handleNavigate}
              />
            )}
            {activeTab === 'production-plans' && (
              <ProductionPlans
                key={`plans-${refreshKey}`}
                onNavigate={handleNavigate}
              />
            )}
            {activeTab === 'production-reports' && (
              <ProductionReports
                key={`prod-reports-${refreshKey}`}
              />
            )}

            {/* Master Data */}
            {activeTab === 'yarn-master' && <YarnMaster key={`yarn-${refreshKey}`} />}
            {activeTab === 'fabric-master' && (
              <FabricMaster
                key={`fabric-${refreshKey}`}
                onSelectCosting={(f) => handleNavigate('new-costing', f)}
              />
            )}
            {activeTab === 'charges' && <ChargesManagement key={`charges-${refreshKey}`} />}

            {/* Reports & Admin */}
            {activeTab === 'reports' && <Reports key={`reports-${refreshKey}`} />}
            {activeTab === 'export' && <ExportCenter key={`export-${refreshKey}`} />}
            {activeTab === 'users' && <Users key={`users-${refreshKey}`} />}
            {activeTab === 'settings' && <Settings />}
          </PageContainer>
        </main>

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          initialDays={selectedDays}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
