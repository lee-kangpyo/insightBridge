import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import MainPage from "./pages/MainPage";
import AdmissionPage from "./pages/AdmissionPage";
import StudentCareerPage from "./pages/StudentCareerPage";
import EducationFacultyPage from "./pages/EducationFacultyPage";
import ResearchIndustryStartupPage from "./pages/ResearchIndustryStartupPage";
import QueryPage from "./pages/QueryPage";
import NotFoundPage from "./pages/NotFoundPage";
import SupportPage from "./pages/SupportPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/admission" element={<AdmissionPage />} />
      <Route path="/student-career" element={<StudentCareerPage />} />
      <Route path="/education-faculty" element={<EducationFacultyPage />} />
      <Route path="/research" element={<ResearchIndustryStartupPage />} />
      {!import.meta.env.PROD && (
        <Route path="/dashboard/legacy" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>
      )}
      {!import.meta.env.PROD && (
        <Route path="/insights" element={<QueryPage />} />
      )}
      <Route path="/support" element={<SupportPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
