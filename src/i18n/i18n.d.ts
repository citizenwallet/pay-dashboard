import en from '../i18n/en.json';
import {formats} from '../i18n/request';

type Messages = typeof en;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}

type Formats = typeof formats;

declare global {
  // Use type safe formats with `next-intl`
  interface IntlFormats extends Formats {}
}
