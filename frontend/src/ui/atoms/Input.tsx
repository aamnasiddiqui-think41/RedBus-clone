
import React from 'react';

// --- TextInput ---
type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TextInput = ({ className = '', ...props }: TextInputProps) => {
  return (
    <input
      type="text"
      className={`border border-border rounded-card p-3 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
};

// --- Select ---
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className = '', children, ...props }: SelectProps) => {
  return (
    <select
      className={`border border-border rounded-card p-3 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

// --- Checkbox ---
type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = ({ className = '', ...props }: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      className={`h-5 w-5 rounded-md border-border text-primary focus:ring-primary ${className}`}
      {...props}
    />
  );
};

// --- RadioButton ---
type RadioButtonProps = React.InputHTMLAttributes<HTMLInputElement>;

export const RadioButton = ({ className = '', ...props }: RadioButtonProps) => {
  return (
    <input
      type="radio"
      className={`h-5 w-5 border-border text-primary focus:ring-primary ${className}`}
      {...props}
    />
  );
};

// --- ToggleSwitch ---
type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const ToggleSwitch = ({ checked, onChange }: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${checked ? 'bg-primary' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300`}
    >
      <span
        className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300`}
      />
    </button>
  );
};
