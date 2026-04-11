import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import GCCommandDashboard from '@/components/dashboard/GCCommandDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useProfileComplete } from '@/hooks/useProfileComplete';

const GeneralContractorDashboard = () => {
  const { user, loading } = useAuth();
  const { isComplete: profileComplete, loading: profileLoading } = useProfileComplete();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (!loading && !profileLoading && user && profileComplete === false) {
      navigate('/complete-profile');
    }
  }, [loading, navigate, profileComplete, profileLoading, user]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <SEOHead
        title="General Contractor Dashboard | Kluje"
        description="General Contractor operations dashboard with communications, materials, workforce, finance, and legal departments."
        noIndex={true}
      />
      <div className="min-h-screen bg-[#07182f]">
        <GCCommandDashboard />
      </div>
    </>
  );
};

export default GeneralContractorDashboard;
