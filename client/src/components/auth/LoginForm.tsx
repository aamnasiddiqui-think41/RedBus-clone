import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (country_code: string, phone: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    setError(null);
    onLogin(countryCode, phone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-center mb-2">Login</h2>
        <p className="text-sm text-gray-500 text-center mb-4">Enter your phone number to receive an OTP</p>
        <div className="flex items-center justify-center mb-2">
          <span className="inline-block mr-2 text-gray-400">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 10h8M8 14h6"/></svg>
          </span>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
        </div>
        <div className="mt-1 flex rounded-md shadow-sm">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
          >
            <option value="+91">+91</option>
            {/* Add other country codes as needed */}
          </select>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
            placeholder="Enter your phone number"
            required
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600 text-center">{error}</p>}
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
      >
        <span className="mr-2">🔒</span> Send OTP
      </button>
    </form>
  );
};