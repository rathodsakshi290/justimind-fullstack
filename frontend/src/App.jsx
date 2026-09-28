import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import WorkspacePage from "./pages/WorkspacePage";
import SummarizerPage from "./pages/SummarizerPage";
import PredictionPage from "./pages/PredictionPage";
import AnalyzerPage from "./pages/AnalyzerPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";
import AdminPage from "./pages/AdminPage";
import NewsPage from "./pages/NewsPage";
import SearchPage from "./pages/SearchPage";
import VerificationPage from "./pages/VerificationPage";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />

            {/* Authenticated Application Routes */}
            <Route path="/workspace" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
            <Route path="/summarizer" element={<ProtectedRoute><SummarizerPage /></ProtectedRoute>} />
            <Route path="/prediction" element={<ProtectedRoute><PredictionPage /></ProtectedRoute>} />
            <Route path="/analyzer" element={<ProtectedRoute><AnalyzerPage /></ProtectedRoute>} />
            <Route path="/verification" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/knowledge-graph" element={<ProtectedRoute><KnowledgeGraphPage /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}
