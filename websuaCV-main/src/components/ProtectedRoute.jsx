import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({
  children,
  fallback = <DefaultFallback />,
  unauthenticatedElement,
}) {
  const { isAuthenticated, isLoadingAuth, authError } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return fallback;
  }

  const defaultRedirect = (
    <Navigate
      to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
      replace
    />
  );

  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement || defaultRedirect;
  }

  return children ? children : <Outlet />;
}
