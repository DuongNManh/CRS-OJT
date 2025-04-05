// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { LanguageContext } from "@/contexts/LanguageContext";
import { useContext } from "react";

export const useLanguage = () => useContext(LanguageContext);
