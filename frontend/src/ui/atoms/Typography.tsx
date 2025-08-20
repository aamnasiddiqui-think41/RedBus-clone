import React from 'react';
import type { ElementType } from 'react';

// --- Heading ---
type HeadingProps = {
  level: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
};

export const Heading = ({ level, children, className = '' }: HeadingProps) => {
  const Tag: ElementType = `h${level}`;
  const styles: Record<HeadingProps['level'], string> = {
    1: 'text-heading',
    2: 'text-card-title',
    3: 'text-body font-bold',
  };

  return (
    <Tag
      className={`${styles[level]} ${className}`}
      role="heading"
      aria-level={level}
    >
      {children}
    </Tag>
  );
};

// --- BodyText ---
type BodyTextProps = {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
};

export const BodyText = ({ children, muted = false, className = '' }: BodyTextProps) => {
  const textColor = muted ? 'text-text-secondary' : 'text-text-primary';
  return <p className={`text-body ${textColor} ${className}`}>{children}</p>;
};

// --- SmallText ---
type SmallTextProps = {
  children: React.ReactNode;
  className?: string;
};

export const SmallText = ({ children, className = '' }: SmallTextProps) => {
  return <small className={`text-stats ${className}`}>{children}</small>;
};
