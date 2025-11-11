"use client";
import { OnboardingProvider, useOnboarding } from "./OnboardingContext";
import StepName from "./steps/StepName";
import StepBirthdate from "./steps/StepBirthdate";
import StepLocation from "./steps/StepLocation";
import StepInterests from "./steps/StepInterests";
import StepLevel from "./steps/StepLevel";
import StepEducation from "./steps/StepEducation";
import StepCurrentJob from "./steps/StepCurrentJob";
import StepConfirm from "./steps/StepConfirm";

function Frame({ children }: { children: React.ReactNode }) {
    const { step, total } = useOnboarding();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-2xl border bg-white p-8 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
                {/* Progress */}
                <div className="mb-5 h-1 w-full rounded bg-gray-200 dark:bg-gray-800/80">
                    <div
                        className="h-1 rounded bg-gray-900 dark:bg-gray-100"
                        style={{ width: `${(Math.min(step, total) / total) * 100}%` }}
                    />
                </div>
                {children}
                <p className="mt-5 text-center text-xs text-gray-600 dark:text-gray-400">
                    Step {Math.min(step, total)} of {total}
                </p>
            </div>
        </div>
    );
}

function Steps() {
    const { step } = useOnboarding();
    if (step === 1) return <StepName />;
    if (step === 2) return <StepBirthdate />;
    if (step === 3) return <StepLocation />;
    if (step === 4) return <StepInterests />;
    if (step === 5) return <StepLevel />;
    if (step === 6) return <StepEducation />;
    if (step === 7) return <StepCurrentJob />;
    return <StepConfirm />; // confirm after step 5
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
