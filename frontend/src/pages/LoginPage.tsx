
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { OTPForm } from '../components/auth/OTPForm';
import { useStore } from '../store/store';

export const LoginPage = () => {
  const { token, verifyOtp } = useStore();
  const navigate = useNavigate();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (token) {
      navigate('/my-details/bookings');
    }
  }, [token, navigate]);

  const handleOtpSent = (phone: string) => {
    setPhone(phone);
    setIsOtpSent(true);
  };

  const handleVerifyOtp = async (otp: string) => {
    await verifyOtp(phone, otp);
    const { error } = useStore.getState();
    if (!error) {
        navigate('/my-details/bookings');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md">
        {!isOtpSent ? (
          <LoginForm onLogin={handleOtpSent} />
        ) : (
          <OTPForm onVerify={handleVerifyOtp} />
        )}
      </div>
    </div>
  );
};
