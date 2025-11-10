"use client";
import { useState, useTransition } from "react";
import { useOnboarding } from "../OnboardingContext";
import { savePartial } from "@/app/onboarding/actions";

const ALL = ["Software", "Data", "Product", "Design", "DevOps", "Security"];

export default function StepInterests() {
    const { data, setData, back, next } = useOnboarding();
    const [picked, setPicked] = useState<string[]>(data.interests ?? []);
    const [err, setErr] = useState<string | null>(null);
    const [pending, start] = useTransition();

    function toggle(v: string) {
        setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
    }

    const submit = () => {
        if (!picked.length) return setErr("Pick at least one interest");
        setErr(null);
        setData({ interests: picked });
        start(async () => {
            await savePartial({ interests: picked }); // JSON column in DB
            next();
        });
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">What are you interested in?</h2>
            <div className="mb-3 flex flex-wrap gap-2">
                {ALL.map((v) => (
                    <button
                        type="button"
                        key={v}
                        onClick={() => toggle(v)}
                        className={`rounded-full border px-3 py-1 text-sm ${picked.includes(v) ? "bg-black text-white" : ""
                            }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
            {err && <p className="mb-3 text-sm text-red-500">{err}</p>}
            <div className="flex gap-2">
                <button onClick={back} className="flex-1 rounded-xl border px-4 py-3">Back</button>
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
