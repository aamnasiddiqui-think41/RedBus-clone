
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
