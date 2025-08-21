
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
