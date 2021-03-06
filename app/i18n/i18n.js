
import ReactNative from 'react-native';
import I18n from 'i18n-js';
import { Localization } from 'expo';
import { AsyncStorage } from 'react-native';

// Import all locales
import en from './locales/en';
import es from './locales/es';
import ca from './locales/ca';

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;
console.log(Localization.locale);
I18n.locale = Localization.locale; // AsyncStorage.getItem('lang') || 




// Define the supported translations
I18n.translations = {
  en,
  es,
  ca
};

const currentLocale = I18n.currentLocale();

// Is it a RTL language?
export const isRTL = currentLocale.indexOf('es') === 0 || currentLocale.indexOf('ca') === 0;


// Allow RTL alignment in RTL languages
ReactNative.I18nManager.allowRTL(isRTL);

// The method we'll use instead of a regular string
function strings(name, params = {}) {
  return I18n.t(name, params);
};

export const ChangeLanguage = (language) => {
  if (language === 'ca-ES' || language === 'en' || language === 'es') {
    I18n.locale = language;
    //AsyncStorage.setItem('lang', language);
    return language;
  }
  return "Error";

}
export default strings;