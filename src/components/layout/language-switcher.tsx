'use client';
import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState('en');
  const router = useRouter();

  useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
    if (cookieLocale) {
      setLanguage(cookieLocale);
    } else {
      const browserLocale = navigator.language.split('-')[0];
      setLanguage(browserLocale);
      document.cookie = `NEXT_LOCALE=${browserLocale};`;
      router.refresh();
    }
  }, [router]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    document.cookie = `NEXT_LOCALE=${newLanguage};`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all " />
          <span className="sr-only">Language Selector</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={`${
            language === 'en' ? 'bg-primary text-primary-foreground' : ''
          }`}
          onClick={() => {
            handleLanguageChange('en');
          }}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${
            language === 'es' ? 'bg-primary text-primary-foreground' : ''
          }`}
          onClick={() => {
            handleLanguageChange('es');
          }}
        >
          Spanish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
