'use client';
import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState('en');

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
            setLanguage('en');
          }}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${
            language === 'es' ? 'bg-primary text-primary-foreground' : ''
          }`}
          onClick={() => {
            setLanguage('es');
          }}
        >
          Spanish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
