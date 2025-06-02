'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface PrimaryButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export default function PrimaryButton({ href, onClick, children, className = '' }: PrimaryButtonProps) {
  const baseStyles = "px-5 py-2 text-white rounded-full font-medium transition-colors inline-block";
  const combinedClassName = `${baseStyles} ${className}`;
  
  const style = {
    backgroundColor: 'var(--primary)',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--primary)';
  };

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={combinedClassName}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}