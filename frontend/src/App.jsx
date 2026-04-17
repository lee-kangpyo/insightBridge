import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireSysAdmRoute from "./components/RequireSysAdmRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import MainPage from "./pages/MainPage";
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
import GroupManagement from "./pages/admin/GroupManagement";
import RoleAuthorityMenu from "./pages/admin/RoleAuthorityMenu";

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
            <MainLayout>
              <MainPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admission"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AdmissionPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-career"
        element={
          <ProtectedRoute>
            <MainLayout>
              <StudentCareerPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/education-faculty"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EducationFacultyPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/research"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ResearchIndustryStartupPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FinancePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/governance"
        element={
          <ProtectedRoute>
            <MainLayout>
              <GovernancePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/campus"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CampusPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SupportPage />
            </MainLayout>
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
        <Route path="groups" element={<GroupManagement />} />
        <Route path="role-authority-menu" element={<RoleAuthorityMenu />} />
      </Route>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
