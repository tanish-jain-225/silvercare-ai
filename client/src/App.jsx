import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { RootLayout } from "./components/layout/RootLayout";
import { ThemeDebugger } from "./components/ui/ThemeDebugger";
import { LanguageSelection } from "./pages/LanguageSelection";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { UserDetails } from "./pages/UserDetails";
import { Home } from "./pages/Home";
import { BlogSection } from "./pages/BlogSection";
import { Reminders } from "./pages/Reminders";
import Emergency from "./pages/Emergency";
import { AskQueries } from "./pages/AskQueries";
import { Profile } from "./pages/Profile";
import { storage } from "./utils/storage";
import { Header } from "./components/layout/Header";
import { BottomNavigation } from "./components/layout/BottomNavigation";
import ErrorBoundary from "./components/ErrorBoundary";
import "./utils/i18n";
import LoadingScreen from './components/LoadingScreen';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useApp();
  // While auth state is loading, show the loading screen
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { language, isAuthenticated, loading } = useApp();
  const location = useLocation();
  // Check if user has selected a language
  const hasSelectedLanguage = storage.get("silvercare_language");

  // Define routes where layout should be hidden
  const hideLayoutRoutes = [
    "/login",
    "/signup",
    "/user-details",
    "/language-selection",
  ];

  // Define routes where only bottom navigation should be hidden
  const hideBottomNavRoutes = ["/ask-queries"];

  // Check if current path matches any of the hideLayoutRoutes
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  // Check if current path matches any of the hideBottomNavRoutes
  const shouldHideBottomNav = hideBottomNavRoutes.includes(location.pathname);

  // Redirect to language selection if no language is selected and not already there
  if (!hasSelectedLanguage && location.pathname !== "/language-selection") {
    return <Navigate to="/language-selection" replace />;
  }

  return (
    <RootLayout>
      {!shouldHideLayout && <Header />}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
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
            path="/blog"
            element={
              <ProtectedRoute>
                <BlogSection />
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
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Catch-all: redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
      {!shouldHideLayout && !shouldHideBottomNav && <BottomNavigation />}
    </RootLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppRoutes />
          </Router>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
