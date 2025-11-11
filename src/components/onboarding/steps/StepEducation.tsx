"use client";
import { useState, useTransition } from "react";
import { useOnboarding } from "../OnboardingContext";
import { saveEducation } from "@/app/onboarding/actions";

export default function StepEducation() {
    const { data, setData, back, next } = useOnboarding();
    const [school, setSchool] = useState(data.education?.school ?? "");
    const [degree, setDegree] = useState(data.education?.degree ?? "");
    const [field, setField] = useState(data.education?.field ?? "");
    const [graduationYear, setYear] = useState(data.education?.graduationYear ?? "");
    const [err, setErr] = useState<string | null>(null);
    const [pending, start] = useTransition();

    const submit = () => {
        if (!school.trim()) return setErr("School is required");
        setErr(null);

        const ed = { school, degree, field, graduationYear };
        setData({ education: ed });

        start(async () => {
            await saveEducation(ed);
            next();
        });
    };

    return (
        <div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">Education</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Add your most recent education.</p>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="School (e.g., UNC Chapel Hill)"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    autoFocus
                />
                <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Degree (e.g., B.S.)"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                />
                <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Field (e.g., Computer Science)"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                />
                <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Graduation year (e.g., 2022)"
                    inputMode="numeric"
                    pattern="\d{4}"
                    value={graduationYear}
                    onChange={(e) => setYear(e.target.value)}
                />
            </div>

            {err && <p className="mb-3 text-sm text-red-600">{err}</p>}

            <div className="flex gap-2">
                <button onClick={back} className="flex-1 rounded-lg border px-4 py-2.5 text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/60">
                    Back
                </button>
                <button
                    disabled={pending}
                    onClick={submit}
                    className="flex-1 rounded-lg border border-gray-900 bg-gray-900 px-4 py-2.5 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
