"use client";
import { useState, useTransition } from "react";
import { useOnboarding } from "../OnboardingContext";
import { savePartial } from "@/app/onboarding/actions";

type L = "junior" | "mid" | "senior" | "lead";

export default function StepLevel() {
    const { data, setData, back, next } = useOnboarding();
    const [level, setLevel] = useState<L | undefined>(data.level as L | undefined);
    const [err, setErr] = useState<string | null>(null);
    const [pending, start] = useTransition();

    const submit = () => {
        if (!level) return setErr("Pick one");
        setErr(null);
        setData({ level });
        start(async () => {
            await savePartial({ level });
            next();
        });
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">Experience level</h2>
            <div className="mb-3 grid grid-cols-2 gap-2">
                {(["junior", "mid", "senior", "lead"] as L[]).map((l) => (
                    <button
                        type="button"
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`rounded-xl border px-3 py-2 capitalize ${level === l ? "bg-black text-white" : ""
                            }`}
                    >
                        {l}
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
