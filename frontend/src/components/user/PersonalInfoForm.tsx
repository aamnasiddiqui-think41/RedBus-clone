
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Button, TextInput } from '../../ui/atoms';

export const PersonalInfoForm = () => {
  const { user, getMe, updateMe } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('token');
      if (token) {
        getMe(token);
      }
    }
  }, [user, getMe]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      updateMe(token, { name, email });
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <TextInput
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <TextInput
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full"
          required
        />
      </div>
      <Button type="submit" variant="primary" className="w-full">
        Save Changes
      </Button>
    </form>
  );
};
