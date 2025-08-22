<<<<<<< Updated upstream

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { OTPForm } from '../components/auth/OTPForm';
import { Navbar } from '../components/shared/Navbar';
import { useStore } from '../store/store';

export const LoginPage = () => {
  const { token, verifyOtp } = useStore();
  const navigate = useNavigate();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (token) {
      navigate('/');
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
        navigate('/');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar showNavigation={false} />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16">
        <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md">
          {!isOtpSent ? (
            <LoginForm onLogin={handleOtpSent} />
          ) : (
            <OTPForm onVerify={handleVerifyOtp} />
          )}
        </div>
      </div>
    </div>
  );
};
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { OTPForm } from '../components/auth/OTPForm';
import { Navbar } from '../components/shared/Navbar';
import { useStore } from '../store/store';

export const LoginPage = () => {
  const { token, requestOtp, verifyOtp } = useStore();
  const navigate = useNavigate();
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleOtpSent = async (country_code: string, phone_number: string) => {
    await requestOtp(country_code, phone_number);
    const { error } = useStore.getState();
    if (!error) {
      setIsOtpSent(true);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    await verifyOtp(otp);
    const { error } = useStore.getState();
    if (!error) {
        navigate('/');
    }
  };

  const handleBackToPhone = () => {
    setIsOtpSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar showNavigation={false} />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {!isOtpSent ? 'Welcome Back' : 'Verify OTP'}
            </h1>
            <p className="text-gray-600">
              {!isOtpSent 
                ? 'Enter your phone number to get started' 
                : 'We\'ve sent a 6-digit code to your phone'
              }
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
            {!isOtpSent ? (
              <LoginForm onLogin={handleOtpSent} />
            ) : (
              <OTPForm onVerify={handleVerifyOtp} onBack={handleBackToPhone} />
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
>>>>>>> Stashed changes
