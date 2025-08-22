import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // in milliseconds
  onClose?: () => void;
  showCountdown?: boolean;
  countdownDuration?: number; // in seconds
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  duration = 40000, // 40 seconds default
  onClose,
  showCountdown = false,
  countdownDuration = 300 // 5 minutes default
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(countdownDuration);

  useEffect(() => {
    // Auto-hide after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  useEffect(() => {
    if (showCountdown && timeLeft > 0) {
      const countdownTimer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [showCountdown, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4`}>
      <div className={`rounded-lg border p-4 shadow-lg ${getTypeStyles()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
            {showCountdown && timeLeft > 0 && (
              <p className="text-xs mt-1 opacity-75">
                Expires in {formatTime(timeLeft)}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="ml-3 inline-flex h-5 w-5 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
