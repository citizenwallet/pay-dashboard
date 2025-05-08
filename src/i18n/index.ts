import { enUS, fr, nlBE } from 'date-fns/locale';
import { getLocale } from 'next-intl/server';

export const localeMap = {
  en: enUS,
  fr: fr,
  nl: nlBE
} as Record<string, Locale>;

export const getFnsLocale = async (): Promise<Locale> => {
  const locale = await getLocale();

  return localeMap[locale] ?? enUS;
};
