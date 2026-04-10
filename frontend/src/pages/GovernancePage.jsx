import MainLayout from '../layouts/MainLayout';
import { GovernanceDashboard } from '../components/governance';

export default function GovernancePage() {
  return (
    <MainLayout>
      <GovernanceDashboard />
    </MainLayout>
  );
}
