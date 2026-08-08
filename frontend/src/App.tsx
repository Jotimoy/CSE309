import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InventoryList from './pages/InventoryList';
import ItemDetail from './pages/ItemDetail';
import AlertsPage from './pages/AlertsPage';
import Dashboard from './pages/Dashboard';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/inventory"
            element={
              <RequireAuth>
                <InventoryList />
              </RequireAuth>
            }
          />
          <Route
            path="/items/:id"
            element={
              <RequireAuth>
                <ItemDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/alerts"
            element={
              <RequireAuth>
                <AlertsPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
