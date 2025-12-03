import React, { useState } from 'react';
import { DataProvider, useData } from './services/dataContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { WorkerDashboard } from './components/WorkerDashboard';
import { ClientsList } from './components/ClientsList';
import { HistoryList } from './components/HistoryList';
import { AdminPanel } from './components/AdminPanel';

const AppContent: React.FC = () => {
  const { auth } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!auth.isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <WorkerDashboard />}
      {activeTab === 'clients' && <ClientsList />}
      {activeTab === 'history' && <HistoryList />}
      {activeTab === 'admin' && <AdminPanel />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;