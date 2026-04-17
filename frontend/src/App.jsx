import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireSysAdmRoute from "./components/RequireSysAdmRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import MainPage from "./pages/MainPage";
import StatsPage from "./pages/StatsPage";
import AdmissionPage from "./pages/AdmissionPage";
import StudentCareerPage from "./pages/StudentCareerPage";
import EducationFacultyPage from "./pages/EducationFacultyPage";
import ResearchIndustryStartupPage from "./pages/ResearchIndustryStartupPage";
import FinancePage from "./pages/FinancePage";
import GovernancePage from "./pages/GovernancePage";
import CampusPage from "./pages/CampusPage";
import QueryPage from "./pages/QueryPage";
import NotFoundPage from "./pages/NotFoundPage";
import SupportPage from "./pages/SupportPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PublicRoute from "./components/PublicRoute";
import RoleMenuMatrix from "./pages/admin/RoleMenuMatrix";
import UserRoleManager from "./pages/admin/UserRoleManager";
import MenuManagement from "./pages/admin/MenuManagement";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admission"
        element={
          <ProtectedRoute>
            <AdmissionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-career"
        element={
          <ProtectedRoute>
            <StudentCareerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/education-faculty"
        element={
          <ProtectedRoute>
            <EducationFacultyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/research"
        element={
          <ProtectedRoute>
            <ResearchIndustryStartupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <FinancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/governance"
        element={
          <ProtectedRoute>
            <GovernancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campus"
        element={
          <ProtectedRoute>
            <CampusPage />
          </ProtectedRoute>
        }
      />
      {!import.meta.env.PROD && (
        <Route
          path="/dashboard/legacy"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>
      )}
      {!import.meta.env.PROD && (
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <QueryPage />
            </ProtectedRoute>
          }
        />
      )}
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireSysAdmRoute>
            <MainLayout />
          </RequireSysAdmRoute>
        }
      >
        <Route index element={<MenuManagement />} />
        <Route path="role-menu" element={<RoleMenuMatrix />} />
        <Route path="users" element={<UserRoleManager />} />
        <Route path="menus" element={<MenuManagement />} />
      </Route>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
