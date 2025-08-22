
import React, { useState, useEffect } from 'react';
import { Button, TextInput } from '../../ui/atoms';
import { Notification } from '../shared/Notification';

interface OTPFormProps {
  onVerify: (otp: string) => void;
  onBack?: () => void;
}

export const OTPForm = ({ onVerify, onBack }: OTPFormProps) => {
  const [otp, setOtp] = useState('');
<<<<<<< Updated upstream
=======
  const [error, setError] = useState<string | null>(null);
  const [showExpiryNotification, setShowExpiryNotification] = useState(false);

  // Show expiry notification after 4 minutes (1 minute before OTP expires)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowExpiryNotification(true);
    }, 240000); // 4 minutes

    return () => clearTimeout(timer);
  }, []);
>>>>>>> Stashed changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp);
  };

  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    setError(null);
  };

  return (
<<<<<<< Updated upstream
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          Enter OTP
        </label>
        <TextInput
          type="text"
          id="otp"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mt-1 w-full"
          placeholder="Enter the 6-digit OTP"
          required
        />
      </div>
      <Button type="submit" variant="primary" className="w-full">
        Verify OTP
      </Button>
    </form>
=======
    <>
      {showExpiryNotification && (
        <Notification
          message="OTP will expire soon! Please enter it quickly."
          type="warning"
          showCountdown={true}
          countdownDuration={60} // 1 minute remaining
          duration={60000} // 1 minute
          onClose={() => setShowExpiryNotification(false)}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
            Enter 6-digit OTP
          </label>
          <div className="relative">
            <TextInput
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
              placeholder="000000"
              required
              maxLength={6}
            />
            {error && (
              <div className="flex items-center mt-2 text-red-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="primary"
          className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verify OTP
        </Button>

        {/* Back Button */}
        {onBack && (
          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to phone number
            </button>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Didn't receive the code?
          </p>
          <button
            type="button"
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
          >
            Resend OTP
          </button>
        </div>
      </form>
    </>
>>>>>>> Stashed changes
  );
};
