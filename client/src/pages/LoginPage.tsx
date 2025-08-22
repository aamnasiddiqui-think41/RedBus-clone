import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { OTPForm } from '../components/auth/OTPForm';
import { Navbar } from '../components/shared/Navbar';
import { useStore } from '../store/store';

export const LoginPage = () => {
  const { token, requestOtp, verifyOtp, debugTokenStatus, syncTokenWithLocalStorage } = useStore();
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

  const handleDebugToken = () => {
    debugTokenStatus();
  };

  const handleSyncTokens = () => {
    syncTokenWithLocalStorage();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar showNavigation={false} />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16">
        <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md">
          {/* Debug buttons */}
          <div className="mb-4 text-center space-y-2">
            <button
              onClick={handleDebugToken}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔍 Debug Token Status
            </button>
            <button
              onClick={handleSyncTokens}
              className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 ml-2"
            >
              ⚙️ Sync Tokens
            </button>
          </div>
          
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