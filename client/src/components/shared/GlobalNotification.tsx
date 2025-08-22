import React, { useEffect } from 'react';
import { useStore } from '../../store/store';
import { Notification } from './Notification';

export const GlobalNotification: React.FC = () => {
  const { notification, clearNotification } = useStore();

  // Auto-clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  return (
    <Notification
      message={notification.message}
      type={notification.type}
      duration={5000}
      onClose={clearNotification}
    />
  );
};
