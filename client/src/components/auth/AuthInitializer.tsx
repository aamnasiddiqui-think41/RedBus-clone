import { useEffect } from 'react';
import { useStore } from '../../store/store';
import { Loader } from '../shared/Loader';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { initializeAuth, isInitializing } = useStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading only during initial auth check
  if (isInitializing) {
    return <Loader />;
  }

  return <>{children}</>;
};
