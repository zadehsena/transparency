// src/components/onboarding/OnboardingContext.tsx
"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type OnboardingData = {
    firstName?: string;
    lastName?: string;
    birthdate?: string; // YYYY-MM-DD
    location?: string;
    interests?: string[];
    level?: "junior" | "mid" | "senior" | "lead";
    education?: {
        school?: string;
        degree?: string;
        field?: string;
        graduationYear?: string;
    };
    job?: {
        company?: string;
        title?: string;
    };
};

type OnboardingContextValue = {
    step: number;
    total: number;
    data: OnboardingData;
    setData: (d: Partial<OnboardingData>) => void;
    next: () => void;
    back: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [step, setStep] = useState(1);
    const [data, setDataState] = useState<OnboardingData>({});

    // 7 steps + confirm = 8
    const total = 8;

    const value = useMemo<OnboardingContextValue>(
        () => ({
            step,
            total,
            data,
            setData: (d) => setDataState((prev) => ({ ...prev, ...d })),
            next: () => setStep((s) => Math.min(s + 1, total)),
            back: () => setStep((s) => Math.max(s - 1, 1)),
        }),
        [step, data]
    );

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const ctx = useContext(OnboardingContext);
    if (!ctx) {
        throw new Error("useOnboarding must be used within OnboardingProvider");
    }
    return ctx;
}
