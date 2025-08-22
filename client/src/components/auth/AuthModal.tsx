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
  const requestOtp = useStore((state) => state.requestOtp);
  const verifyOtp = useStore((state) => state.verifyOtp);

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