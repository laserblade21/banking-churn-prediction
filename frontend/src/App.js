import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './components/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerDetailView from './components/CustomerDetailView';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import SettingsPage from './components/settings/SettingsPage';
import ErrorBoundary from './components/common/ErrorBoundary';

// Custom route with layout
const LayoutRoute = ({ element }) => {
  return (
    <AppLayout>
      <ErrorBoundary>
        {element}
      </ErrorBoundary>
    </AppLayout>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LayoutRoute element={<Dashboard />} />} />
        <Route path="/customers" element={<LayoutRoute element={<CustomerList />} />} />
        <Route path="/customers/:id" element={<LayoutRoute element={<CustomerDetailView />} />} />
        <Route path="/analytics" element={<LayoutRoute element={<AnalyticsPage />} />} />
        <Route path="/settings" element={<LayoutRoute element={<SettingsPage />} />} />
        
        {/* Redirect all other routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;