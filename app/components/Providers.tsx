"use client";

import { LocaleProvider, Locale } from "../../lib/i18n";

type Dict = Record<string, unknown>;

interface ProvidersProps {
    children: React.ReactNode;
    initialLocale?: Locale;
    initialDict?: Dict;
}

export default function Providers({ children, initialLocale, initialDict }: ProvidersProps) {
    return (
        <LocaleProvider initialLocale={initialLocale} initialDict={initialDict}>
            {children}
        </LocaleProvider>
    );
}
