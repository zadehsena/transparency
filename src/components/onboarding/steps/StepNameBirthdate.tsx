// src/components/onboarding/steps/StepNameBirthdate.tsx
"use client";

import { useState, useTransition } from "react";
import { useOnboarding } from "../OnboardingContext";
import { savePartial } from "@/app/onboarding/actions";

export default function StepNameBirthdate() {
    const { data, setData, back, next } = useOnboarding();
    const [firstName, setFirst] = useState(data.firstName ?? "");
    const [lastName, setLast] = useState(data.lastName ?? "");
    const [birthdate, setBD] = useState(data.birthdate ?? "");
    const [err, setErr] = useState<string | null>(null);
    const [pending, start] = useTransition();

    function validate() {
        if (!firstName.trim() || !lastName.trim()) {
            return "Both first and last name are required";
        }
        if (firstName.length > 50 || lastName.length > 50) {
            return "Names must be at most 50 characters";
        }
        if (!birthdate || Number.isNaN(Date.parse(birthdate))) {
            return "Enter a valid date (YYYY-MM-DD)";
        }
        return null;
    }

    const submit = () => {
        const v = validate();
        if (v) {
            setErr(v);
            return;
        }
        setErr(null);

        setData({ firstName, lastName, birthdate });

        start(async () => {
            await savePartial({ firstName, lastName, birthdate });
            next();
        });
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">Lets get the basics</h2>

            <div className="mb-3 grid grid-cols-2 gap-3">
                <input
                    className="rounded-xl border px-3 py-2"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirst(e.target.value)}
                    autoFocus
                />
                <input
                    className="rounded-xl border px-3 py-2"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLast(e.target.value)}
                />
            </div>

            <input
                type="date"
                className="mb-3 w-full rounded-xl border px-3 py-2"
                value={birthdate}
                onChange={(e) => setBD(e.target.value)}
            />

            {err && <p className="mb-3 text-sm text-red-500">{err}</p>}

            <div className="flex gap-2">
                {back && (
                    <button
                        onClick={back}
                        className="flex-1 rounded-xl border px-4 py-3"
                        type="button"
                    >
                        Back
                    </button>
                )}
                <button
                    disabled={pending}
                    onClick={submit}
                    className="flex-1 rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
                    type="button"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
