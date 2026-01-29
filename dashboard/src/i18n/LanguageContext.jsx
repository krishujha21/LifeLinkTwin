/**
 * Language Context - Provides translations throughout the app
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getTranslation, getLanguageTranslations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('lifelink-language') || 'en';
    });

    const [translations, setTranslations] = useState(() => getLanguageTranslations(language));

    // Update translations when language changes
    useEffect(() => {
        setTranslations(getLanguageTranslations(language));
        localStorage.setItem('lifelink-language', language);
        // Update document direction for RTL languages
        document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    }, [language]);

    const changeLanguage = useCallback((newLanguage) => {
        setLanguage(newLanguage);
    }, []);

    // Translation function
    const t = useCallback((key) => {
        return translations[key] || key;
    }, [translations]);

    const value = {
        language,
        changeLanguage,
        t,
        translations
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook to use language context
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
