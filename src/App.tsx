import React, { useState } from 'react';
import { Header } from './components/Header/Header';
import { LeftSidebar } from './components/Sidebar/LeftSidebar';
import { MainDataViewer } from './components/DataViewer/MainDataViewer';
import { RightHierarchyPanel } from './components/HierarchyTree/RightHierarchyPanel';
import { ConnectionModal } from './components/ConnectionConfig/ConnectionModal';
import { useConnectionStatus } from './hooks/useConnectionStatus';
import { useDataHierarchy } from './hooks/useDataHierarchy';
import { EntityType } from './types/dbs';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('browser');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState('global');

  // API Connection Hook
  const connection = useConnectionStatus();

  // Hierarchy Navigation & Entity Data Hook
  const hierarchy = useDataHierarchy(connection.isConnected, connection.baseUrl);

  // Handle Search submit from Header
  const handleSearch = (query: string) => {
    hierarchy.selectNode(query);
  };

  const handleSelectNode = (id: string, type?: EntityType) => {
    hierarchy.selectNode(id, type);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Top CERN Header */}
      <Header
        isConnected={connection.isConnected}
        isChecking={connection.isChecking}
        baseUrl={connection.baseUrl}
        onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
        onSearch={handleSearch}
        selectedInstance={selectedInstance}
        onInstanceChange={setSelectedInstance}
      />

      {/* 2. Main Three-Pane Application Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <LeftSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isConnected={connection.isConnected}
          onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
        />

        {/* Center Main Data Content View */}
        <MainDataViewer
          isConnected={connection.isConnected}
          selectedEntity={hierarchy.selectedEntity}
          summary={hierarchy.summary}
          rawMetadata={hierarchy.rawMetadata}
          previewData={hierarchy.previewData}
          parentChain={hierarchy.parentChain}
          isLoading={hierarchy.isLoading}
          error={hierarchy.error}
          onSelectNode={handleSelectNode}
          onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
        />

        {/* Right Hierarchy Tree Navigation Panel */}
        <RightHierarchyPanel
          isConnected={connection.isConnected}
          selectedEntity={hierarchy.selectedEntity}
          parentChain={hierarchy.parentChain}
          children={hierarchy.children}
          isLoading={hierarchy.isLoadingHierarchy}
          error={hierarchy.hierarchyError}
          onSelectNode={handleSelectNode}
        />
      </div>

      {/* 3. API Connection Configuration Modal */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        currentBaseUrl={connection.baseUrl}
        onSaveUrl={connection.updateBaseUrl}
        isConnected={connection.isConnected}
      />
    </div>
  );
};

export default App;
