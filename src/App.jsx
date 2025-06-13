import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageSelection } from './pages/LanguageSelection';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { UserDetails } from './pages/UserDetails';
import { Home } from './pages/Home';
import { DailyPlanner } from './pages/DailyPlanner';
import { Reminders } from './pages/Reminders';
import { Emergency } from './pages/Emergency';
import { AskQueries } from './pages/AskQueries';
import { Profile } from './pages/Profile';
import { storage } from './utils/storage';
import './utils/i18n';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { language } = useApp();
  
  // Check if user has selected a language
  const hasSelectedLanguage = storage.get('silvercare_language');
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            hasSelectedLanguage ? 
              <Navigate to="/login" /> : 
              <Navigate to="/language-selection" />
          } 
        />
        <Route path="/language-selection" element={<LanguageSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/user-details" 
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/daily-planner" 
          element={
            <ProtectedRoute>
              <DailyPlanner />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reminders" 
          element={
            <ProtectedRoute>
              <Reminders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/emergency" 
          element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ask-queries" 
          element={
            <ProtectedRoute>
              <AskQueries />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/voice" 
          element={
            <ProtectedRoute>
              <AskQueries />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;