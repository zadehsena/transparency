// src/components/onboarding/steps/StepConfirm.tsx
"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "../OnboardingContext";
import { completeOnboarding } from "@/app/onboarding/actions";

export default function StepConfirm() {
    const { data, back } = useOnboarding();
    const [pending, start] = useTransition();
    const router = useRouter();

    const finish = () => {
        start(async () => {
            const url = await completeOnboarding();
            router.replace(url);
        });
    };

    return (
        <div>
            <h2 className="mb-3 text-xl font-semibold">All set 🎉</h2>
            <p className="mb-3 text-sm text-gray-500">Here’s what we saved:</p>
            <pre className="mb-4 max-h-40 overflow-auto rounded-lg bg-gray-100 p-3 text-sm">
                {JSON.stringify(data, null, 2)}
            </pre>
            <div className="flex gap-2">
                <button onClick={back} className="flex-1 rounded-xl border px-4 py-3">
                    Back
                </button>
                <button
                    disabled={pending}
                    onClick={finish}
                    className="flex-1 rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
                >
                    Finish
                </button>
            </div>
        </div>
    );
}
