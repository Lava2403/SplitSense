import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/GroupPage";
import ExpensesPage from "./pages/ExpensesPage";
import TestApi from "./pages/TestApi";
import GroupsPage from "./pages/GroupsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./utils/auth";
import SettlementPage from "./pages/SettlementPage";
import BudgetPlanner from "./pages/BudgetPlanner";
import Insights from "./pages/Insights";

function PublicOnlyRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/group/:id"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settlements"
          element={
            <ProtectedRoute>
              <SettlementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/budget-planner"
          element={
            <ProtectedRoute>
              <BudgetPlanner />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/insights" 
          element={
          <Insights />
          } 
        />

        <Route
          path="/test-api"
          element={
            <ProtectedRoute>
              <TestApi />
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;