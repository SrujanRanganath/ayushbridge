import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import MappingPage from './pages/MappingPage';
import BundleViewerPage from './pages/BundleViewerPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Main Redirect to Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="mapping" element={<MappingPage />} />
            <Route path="bundle" element={<BundleViewerPage />} />
          </Route>
          
          {/* Public Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


