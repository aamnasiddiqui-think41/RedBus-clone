<<<<<<< Updated upstream

import React, { useState } from 'react';
import { Button, TextInput, Select } from '../../ui/atoms';

interface LoginFormProps {
  onLogin: (phone: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(`${countryCode}${phone}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-primary">
          Phone Number
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <Select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="rounded-r-none border-primary"
          >
            <option value="+91">+91 (India)</option>
            {/* Add other country codes as needed */}
          </Select>
          <TextInput
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 rounded-l-none border-primary"
            placeholder="Enter your phone number"
            required
          />
        </div>
      </div>
      <Button type="submit" variant="primary" className="w-full">
        Send OTP
      </Button>
    </form>
  );
};
=======
import React, { useState } from 'react';
import { Button } from '../../ui/atoms/Button';
import { TextInput, Select } from '../../ui/atoms/Input';
import { Notification } from '../shared/Notification';

interface LoginFormProps {
  onLogin: (country_code: string, phone: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState<string | null>(null);
  const [showOtpNotification, setShowOtpNotification] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    setError(null);
    setShowOtpNotification(true);
    onLogin(countryCode, phone);
  };

  return (
    <>
      {showOtpNotification && (
        <Notification
          message="OTP sent successfully! Please check your phone."
          type="success"
          showCountdown={true}
          countdownDuration={300} // 5 minutes
          duration={40000} // 40 seconds
          onClose={() => setShowOtpNotification(false)}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phone Number Input */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
            Phone Number
          </label>
          <div className="relative">
            <div className="flex rounded-xl shadow-sm border border-gray-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all duration-200">
              <Select
                value={countryCode}
                onChange={(value) => setCountryCode(value)}
                className="inline-flex items-center px-4 py-3 rounded-l-xl border-0 border-r border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium focus:ring-0 focus:border-gray-200"
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+86">🇨🇳 +86</option>
              </Select>
              <TextInput
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={(value) => setPhone(value)}
                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-r-xl border-0 focus:ring-0 focus:border-0 text-gray-900 placeholder-gray-400 text-base"
                placeholder="Enter your phone number"
                required
              />
            </div>
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
          className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Send OTP
        </Button>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            We'll send you a one-time password to verify your number
          </p>
        </div>
      </form>
    </>
  );
};
>>>>>>> Stashed changes
