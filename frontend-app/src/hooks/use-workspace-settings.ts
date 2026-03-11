import { useContext, useCallback } from 'react';
import { AuthContext } from '@/features/auth/context/auth-context';
import enTranslations from '@/locales/en.json';
import esTranslations from '@/locales/es.json';

// Línea 6: Record<string, any> → tipo recursivo
type LocaleDict = Record<string, string | Record<string, string | Record<string, string>>>;

const translations: Record<string, LocaleDict> = {
    'en-US': enTranslations,
    'en': enTranslations,
    'es-GT': esTranslations,
    'es': esTranslations,
};

// Tipo para moneda (línea 27)
interface Currency {
    code: string;
    symbol: string;
    name: string;
    isDefault?: boolean;
}

// Tipo para impuesto (línea 86-87)
interface Tax {
    isActive: boolean;
    isDefault: boolean;
    [key: string]: unknown;
}

export function useWorkspaceSettings() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useWorkspaceSettings must be used within an AuthProvider');
    }

    const { activeWorkspace } = context;

    const language = activeWorkspace?.language || 'es';
    const timezone = activeWorkspace?.timezone || 'America/Guatemala';

    // Línea 27: (c: any) → (c: Currency)
    const defaultCurrencyObj = activeWorkspace?.currencies?.find((c: Currency) => c.isDefault) ||
        activeWorkspace?.currencies?.[0] ||
        { code: 'GTQ', symbol: 'Q', name: 'Quetzal' };

    const defaultCurrencyCode = defaultCurrencyObj.code;

    const t = useCallback((key: string): string => {
        let dict = translations[language] || translations['es'];
        if (!translations[language]) {
            const baseLang = language.split('-')[0];
            dict = translations[baseLang] || translations['es'];
        }

        const keys = key.split('.');
        // Línea 46: any → unknown
        let value: unknown = dict;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    }, [language]);

    const formatCurrencyValue = useCallback((amount: number, currencyCode: string = defaultCurrencyCode) => {
        const localeToUse = language === 'en' || language === 'en-US' ? 'en-US' : 'es-GT';
        return new Intl.NumberFormat(localeToUse, {
            style: 'currency',
            currency: currencyCode,
        }).format(amount);
    }, [language, defaultCurrencyCode]);

    const formatDateValue = useCallback((date: Date | string | number) => {
        const localeToUse = language === 'en' || language === 'en-US' ? 'en-US' : 'es-GT';
        const d = new Date(date);
        return new Intl.DateTimeFormat(localeToUse, {
            timeZone: timezone,
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(d);
    }, [language, timezone]);

    // Líneas 86-87: (t: any) → (t: Tax)
    const activeTaxes = activeWorkspace?.taxes?.filter((t: Tax) => t.isActive) || [];
    const defaultTaxes = activeTaxes.filter((t: Tax) => t.isDefault);

    return {
        workspace: activeWorkspace,
        language,
        timezone,
        defaultCurrencyCode,
        defaultCurrencyObj,
        activeTaxes,
        defaultTaxes,
        t,
        formatCurrency: formatCurrencyValue,
        formatDate: formatDateValue,
    };
}