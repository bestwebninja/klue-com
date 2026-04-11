export type LifecycleStatus = 'submitted' | 'approved' | 'rejected' | 'needs_info';

export const canTransitionLifecycle = (from: LifecycleStatus, to: LifecycleStatus) => {
  if (from === 'submitted') return ['approved', 'rejected', 'needs_info'].includes(to);
  if (from === 'needs_info') return ['approved', 'rejected'].includes(to);
  return false;
};

export const requiresAdmin = (role: string | undefined) => role === 'admin';
