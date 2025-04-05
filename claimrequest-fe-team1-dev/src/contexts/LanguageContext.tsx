// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { createContext } from "react";

export interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "en",
  changeLanguage: () => {},
});
