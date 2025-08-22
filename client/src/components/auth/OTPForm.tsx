
import React, { useState } from 'react';
import { Button, TextInput } from '../../ui/atoms';

interface OTPFormProps {
  onVerify: (otp: string) => void;
}

export const OTPForm = ({ onVerify }: OTPFormProps) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp);
  };

  return (
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
          onChange={(value) => setOtp(value)}
          className="mt-1 w-full"
          placeholder="Enter the 6-digit OTP"
          required
        />
      </div>
      <Button type="submit" variant="primary" className="w-full">
        Verify OTP
      </Button>
    </form>
  );
};
