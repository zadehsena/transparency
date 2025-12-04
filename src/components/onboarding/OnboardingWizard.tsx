// src/components/onboarding/OnboardingWizard.tsx
"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingProvider, useOnboarding } from "./OnboardingContext";
import StepName from "./steps/StepNameBirthdate";
import StepLocation from "./steps/StepLocation";
import StepInterests from "./steps/StepInterests";
import StepLevel from "./steps/StepLevel";
import StepEducation from "./steps/StepEducation";
import StepCurrentJob from "./steps/StepCurrentJob";
import StepConfirm from "./steps/StepConfirm";
import StepNameBirthdate from "./steps/StepNameBirthdate";

function Frame({ children }: { children: React.ReactNode }) {
    const { step, total, next } = useOnboarding();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900">
                <div className="flex flex-col md:flex-row">
                    {/* LEFT: onboarding content */}
                    <div className="flex w-full flex-col p-6 md:w-1/2 md:p-8">
                        {/* Progress bar + Skip button */}
                        <div className="mb-4 flex items-center justify-between">
                            {/* Progress bar */}
                            <div className="h-1 flex-1 rounded bg-gray-200 dark:bg-gray-800/80">
                                <div
                                    className="h-1 rounded bg-gray-900 dark:bg-gray-100"
                                    style={{
                                        width: `${(Math.min(step, total) / total) * 100}%`,
                                    }}
                                />
                            </div>

                            {/* Skip button (hidden on final step) */}
                            {step < total && (
                                <button
                                    type="button"
                                    onClick={next}
                                    className="ml-3 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Skip
                                </button>
                            )}
                        </div>

                        {/* Animated step content */}
                        <div className="flex-1 min-h-[260px] max-h-[260px] overflow-hidden">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={step} // 👈 re-animate on each step change
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -24 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="h-full overflow-y-auto"
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Step indicator */}
                        <p className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
                            Step {Math.min(step, total)} of {total}
                        </p>
                    </div>

                    {/* RIGHT: image side */}
                    <div className="hidden bg-gray-900 text-white md:block md:w-1/2">
                        <div className="relative h-full w-full min-h-[360px]">
                            <Image
                                src="/images/ID.png"
                                alt="Job search and applications"
                                fill
                                className="object-cover opacity-90"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <h3 className="mb-2 text-xl font-semibold">
                                    Tell us a bit about you.
                                </h3>
                                <p className="max-w-xs text-sm text-gray-200">
                                    We use your background and interests to surface roles and
                                    companies that actually make sense for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Steps() {
    const { step } = useOnboarding();

    if (step === 1) return <StepNameBirthdate />;
    if (step === 2) return <StepLocation />;
    if (step === 3) return <StepInterests />;
    if (step === 4) return <StepLevel />;
    if (step === 5) return <StepEducation />;
    if (step === 6) return <StepCurrentJob />;
    return <StepConfirm />;
}

export default function OnboardingWizard() {
    return (
        <OnboardingProvider>
            <Frame>
                <Steps />
            </Frame>
        </OnboardingProvider>
    );
}
