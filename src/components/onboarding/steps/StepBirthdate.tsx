// src/components/onboarding/steps/StepBirthdate.tsx
"use client";
import { useState, useTransition } from "react";
import { useOnboarding } from "../OnboardingContext";
import { savePartial } from "@/app/onboarding/actions";

export default function StepBirthdate() {
    const { data, setData, back, next } = useOnboarding();
    const [birthdate, setBD] = useState(data.birthdate ?? "");
    const [err, setErr] = useState<string | null>(null);
    const [pending, start] = useTransition();

    const submit = () => {
        if (!birthdate || Number.isNaN(Date.parse(birthdate))) {
            return setErr("Enter a valid date (YYYY-MM-DD)");
        }
        setErr(null);
        setData({ birthdate });
        start(async () => {
            await savePartial({ birthdate });
            next();
        });
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">When’s your birthday?</h2>
            <input
                type="date"
                className="mb-3 w-full rounded-xl border px-3 py-2"
                value={birthdate}
                onChange={(e) => setBD(e.target.value)}
            />
            {err && <p className="mb-3 text-sm text-red-500">{err}</p>}
            <div className="flex gap-2">
                <button onClick={back} className="flex-1 rounded-xl border px-4 py-3">
                    Back
                </button>
                <button
                    disabled={pending}
                    onClick={submit}
                    className="flex-1 rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
