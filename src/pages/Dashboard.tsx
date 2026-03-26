import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdmin } from '@/hooks/useAdmin';
import { useProfileComplete } from '@/hooks/useProfileComplete';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { lazy, Suspense } from 'react';

const ProviderDashboard = lazy(() => import('./ProviderDashboard'));
const UserDashboard = lazy(() => import('./UserDashboard'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isProvider, isAdmin, loading: roleLoading } = useUserRole();
  const { isComplete: profileComplete, loading: profileLoading } = useProfileComplete();
  const navigate = useNavigate();

  const isLoading = authLoading || roleLoading || profileLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!isLoading && user && profileComplete === false) {
      navigate('/complete-profile');
    }
  }, [isLoading, user, profileComplete, navigate]);

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {isAdmin ? (
        <AdminDashboard />
      ) : isProvider ? (
        <ProviderDashboard />
      ) : (
        <UserDashboard />
      )}
    </Suspense>
  );
};

export default Dashboard;
