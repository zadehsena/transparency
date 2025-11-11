"use client";
import { createContext, useContext, useMemo, useState } from "react";

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

type Ctx = {
    step: number;
    total: number;
    data: OnboardingData;
    setData: (d: Partial<OnboardingData>) => void;
    next: () => void;
    back: () => void;
};

const C = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [step, setStep] = useState(1);
    const [data, setDataState] = useState<OnboardingData>({});
    const total = 7; // Name, Birthdate, Location, Interests, Level (Confirm shown after)

    const value = useMemo<Ctx>(() => ({
        step,
        total,
        data,
        setData: (d) => setDataState((p) => ({ ...p, ...d })),
        next: () => setStep((s) => Math.min(s + 1, total)),
        back: () => setStep((s) => Math.max(s - 1, 1)),
    }), [step, data]);

    return <C.Provider value={value}>{children}</C.Provider>;
}

export const useOnboarding = () => {
    const ctx = useContext(C);
    if (!ctx) throw new Error("OnboardingContext missing");
    return ctx;
};
