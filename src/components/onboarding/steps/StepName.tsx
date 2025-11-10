"use client";
import { useState, useTransition } from "react";
import { useOnboarding } from "../OnboardingContext";
import { savePartial } from "@/app/onboarding/actions";

export default function StepName() {
    const { data, setData, next } = useOnboarding();
    const [firstName, setFirst] = useState(data.firstName ?? "");
    const [lastName, setLast] = useState(data.lastName ?? "");
    const [err, setErr] = useState<string | null>(null);
    const [pending, start] = useTransition();

    function validate() {
        if (!firstName.trim() || !lastName.trim()) return "Both fields are required";
        if (firstName.length > 50 || lastName.length > 50) return "Max 50 chars";
        return null;
    }

    const submit = () => {
        const v = validate();
        if (v) return setErr(v);
        setErr(null);
        setData({ firstName, lastName });
        start(async () => {
            await savePartial({ firstName, lastName });
            next();
        });
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">What’s your name?</h2>
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
            {err && <p className="mb-3 text-sm text-red-500">{err}</p>}
            <button
                disabled={pending}
                onClick={submit}
                className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
            >
                Continue
            </button>
        </div>
    );
}
