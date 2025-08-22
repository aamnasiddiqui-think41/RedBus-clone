<<<<<<< Updated upstream

import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { LoginForm } from './LoginForm';
import { OTPForm } from './OTPForm';
import { useStore } from '../../store/store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phone, setPhone] = useState('');
  const requestOtp = useStore((state) => state.requestOtp);
  const verifyOtp = useStore((state) => state.verifyOtp);

  const handleLogin = async (phoneNumber: string) => {
    setPhone(phoneNumber);
    await requestOtp(phoneNumber);
    setIsOtpSent(true);
  };

  const handleVerify = async (otp: string) => {
    await verifyOtp(phone, otp);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {!isOtpSent ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <OTPForm onVerify={handleVerify} />
      )}
    </Modal>
  );
};
=======
import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { LoginForm } from './LoginForm';
import { OTPForm } from './OTPForm';
import { Notification } from '../shared/Notification';
import { useStore } from '../../store/store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const requestOtp = useStore((state) => state.requestOtp);
  const verifyOtp = useStore((state) => state.verifyOtp);
  const { error, loading } = useStore();

  // Watch for errors and show notifications
  useEffect(() => {
    if (error && !loading) {
      setErrorMessage(error);
      setShowErrorNotification(true);
    }
  }, [error, loading]);

  const handleLogin = async (country_code: string, phone: string) => {
    await requestOtp(country_code, phone);
    const { error } = useStore.getState();
    if (!error) {
      setIsOtpSent(true);
    }
  };

  const handleVerify = async (otp: string) => {
    await verifyOtp(otp);
    const { error } = useStore.getState();
    if (!error) {
      onClose();
    }
  };

  const handleCloseError = () => {
    setShowErrorNotification(false);
    setErrorMessage('');
  };

  return (
    <>
      {showErrorNotification && (
        <Notification
          message={errorMessage}
          type="error"
          duration={5000} // 5 seconds for errors
          onClose={handleCloseError}
        />
      )}
      
      <Modal isOpen={isOpen} onClose={onClose}>
        {!isOtpSent ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <OTPForm onVerify={handleVerify} />
        )}
      </Modal>
    </>
  );
};
>>>>>>> Stashed changes
