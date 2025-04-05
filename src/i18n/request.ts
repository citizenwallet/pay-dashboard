import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  console.log('locale', locale);

  try {
    return {
      messages: (await import(`./${locale}.json`)).default,
      locale
    };
  } catch (error) {
    return {
      messages: (await import('./en.json')).default,
      locale: 'en'
    };
  }
});
