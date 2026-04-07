import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import QueryPage from './pages/QueryPage';
import NotFoundPage from './pages/NotFoundPage';
import SupportPage from './pages/SupportPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="/insights" element={<QueryPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
