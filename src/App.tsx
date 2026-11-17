import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { JoyaProvider } from './context/JoyaContext';
import { HomePage } from './pages/HomePage';
import { CategorySystemsPage } from './pages/CategorySystemsPage';
import { AboutPage } from './pages/AboutPage';
import { SystemDetailPage } from './pages/SystemDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  return (
    <HelmetProvider>
      <JoyaProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/systems" element={<CategorySystemsPage mode="all" />} />
            <Route path="/core-systems" element={<CategorySystemsPage mode="core" />} />
            <Route path="/sub-systems" element={<CategorySystemsPage mode="additional" />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/system/:slug" element={<SystemDetailPage />} />
            <Route path="/system/:slug/:section" element={<SystemDetailPage />} />
            <Route path="/ادمن" element={<AdminDashboardPage />} />
            <Route path="/ادمن/:tab" element={<AdminDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/:tab" element={<AdminDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </JoyaProvider>
    </HelmetProvider>
  );
}
