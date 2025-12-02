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
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-xl font-semibold">You’re all set 🎉</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Here’s a quick summary before finishing your setup.
                </p>
            </div>

            <div className="space-y-4">
                {/* Name */}
                {(data.firstName || data.lastName) && (
                    <SummaryCard title="Name">
                        {data.firstName} {data.lastName}
                    </SummaryCard>
                )}

                {/* Location */}
                {data.location && (
                    <SummaryCard title="Location">
                        {data.location}
                    </SummaryCard>
                )}

                {/* Interests */}
                {data.interests?.length ? (
                    <SummaryCard title="Interests">
                        {data.interests.join(", ")}
                    </SummaryCard>
                ) : null}

                {/* Level */}
                {data.level && (
                    <SummaryCard title="Experience Level">
                        {data.level.charAt(0).toUpperCase() + data.level.slice(1)}
                    </SummaryCard>
                )}

                {/* Education */}
                {data.education && (
                    <SummaryCard title="Education">
                        {(data.education.degree || "") +
                            (data.education.field ? ` in ${data.education.field}` : "")}
                        <br />
                        {data.education.school}
                        {data.education.graduationYear
                            ? ` (${data.education.graduationYear})`
                            : ""}
                    </SummaryCard>
                )}

                {/* Job */}
                {data.job && (
                    <SummaryCard title="Current Role">
                        {data.job.title || "—"} at {data.job.company || "—"}
                    </SummaryCard>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={back}
                    className="flex-1 rounded-xl border px-4 py-3"
                >
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

function SummaryCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-800/50">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-gray-200">
                {title}
            </h4>
            <p className="text-gray-700 dark:text-gray-300">{children}</p>
        </div>
    );
}
