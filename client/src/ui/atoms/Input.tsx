
import React from 'react';

// --- TextInput ---
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onChange?: (value: string) => void;
}

export const TextInput = ({ 
  className = '', 
  label,
  onChange,
  value,
  ...props 
}: TextInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        value={value || ''}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
}

export const Select = ({ 
  className = '', 
  children, 
  label,
  options,
  onChange,
  value,
  ...props 
}: SelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        value={value || ''}
        onChange={handleChange}
        {...props}
      >
        {options ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
    </div>
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
