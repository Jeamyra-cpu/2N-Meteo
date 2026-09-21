import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fr from "./Langues/fr.json";
import en from "./Langues/en.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        resources: {
            fr: { translation: fr},
            en: { translation: en}
        },

        fallbacking: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;