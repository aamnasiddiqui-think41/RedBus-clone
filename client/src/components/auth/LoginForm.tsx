import React, { useState } from 'react';
import { Button } from '../../ui/atoms/Button';
import { TextInput, Select } from '../../ui/atoms/Input';

interface LoginFormProps {
  onLogin: (country_code: string, phone: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(countryCode, phone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <Select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
          >
            <option value="+91">+91</option>
            {/* Add other country codes as needed */}
          </Select>
          <TextInput
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
      </div>
      <Button type="submit" className="w-full">
        Send OTP
      </Button>
    </form>
  );
};