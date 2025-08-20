import React from 'react';

// --- Button ---
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset'; // ✅ Added this so you can pass type="submit"
};

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button', // ✅ default type
}: ButtonProps) => {
  const baseStyles = 'font-bold rounded-button h-[48px] px-5 transition-colors duration-300';
  const variantStyles = {
    primary: 'bg-primary text-button-text hover:bg-primary-hover',
    secondary: 'border border-primary text-primary hover:bg-primary hover:text-button-text',
  };

  return (
    <button
      type={type} // ✅ Now supported
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

// --- IconButton ---
type IconButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset'; // ✅ added type here too (optional)
};

export const IconButton = ({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: IconButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-full hover:bg-gray-200 transition-colors duration-300 ${className}`}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};
