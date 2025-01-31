'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import lightLogo from '@/assets/logo-light.png';
import darkLogo from '@/assets/logo-dark.png';
import neutralLogo from '@/assets/logo-dark.png'; // Add a neutral logo

export default function Logo() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a neutral logo during hydration
  if (!mounted) {
    return (
      <div className="relative w-[150px] h-[50px]">
        <Image
          src={neutralLogo}
          width={2000}
          height={751}
          alt="Logo"
          className="object-contain"
          priority // Only preload the neutral logo
        />
      </div>
    );
  }

  // Get the actual theme (system or user-set)
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoSrc = currentTheme === 'dark' ? darkLogo : lightLogo;

  return (
    <div className="relative w-[150px] h-[50px]">
      <Image
        src={logoSrc}
        width={2000}
        height={751}
        alt="Logo"
        className="object-contain"
        // No priority here
      />
    </div>
  );
}
