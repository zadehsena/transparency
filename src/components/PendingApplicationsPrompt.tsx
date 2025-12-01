// src/components/PendingApplicationsPrompt.tsx
"use client";

import { useEffect, useState } from "react";

type PendingJob = {
    id: string;
    jobId: string;
    createdAt: string;
    job: {
        id: string;
        title: string;
        company: string;
    };
};

export default function PendingApplicationsPrompt() {
    const [pending, setPending] = useState<PendingJob[]>([]);
    const [visible, setVisible] = useState(false);
    const [loadingIds, setLoadingIds] = useState<string[]>([]);

    // Fetch pending clicked applications
    const fetchPending = async () => {
        try {
            const res = await fetch("/api/applications/pending", {
                method: "GET",
                cache: "no-store",
            });
            if (!res.ok) return;

            const data = (await res.json()) as { applications: PendingJob[] };

            if (data.applications?.length) {
                setPending(data.applications);
                setVisible(true);
            } else {
                setPending([]);
                setVisible(false);
            }
        } catch (err) {
            console.error("Failed to load pending applications", err);
        }
    };

    useEffect(() => {
        // initial check shortly after mount
        const timer = setTimeout(() => {
            fetchPending();
        }, 400); // quick but not instant

        // check again whenever the window regains focus (coming back from ATS tab)
        const handleFocus = () => {
            fetchPending();
        };

        if (typeof window !== "undefined") {
            window.addEventListener("focus", handleFocus);
        }

        return () => {
            clearTimeout(timer);
            if (typeof window !== "undefined") {
                window.removeEventListener("focus", handleFocus);
            }
        };
    }, []);

    const handleConfirm = async (jobId: string) => {
        setLoadingIds((ids) => [...ids, jobId]);

        try {
            await fetch("/api/applications/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId }),
            });

            setPending((prev) => prev.filter((p) => p.jobId !== jobId));
        } catch (err) {
            console.error("Failed to confirm application", err);
        } finally {
            setLoadingIds((ids) => ids.filter((id) => id !== jobId));
        }
    };

    const handleNotYet = (jobId: string) => {
        // Hide it from the current view; remains `clicked` in DB
        setPending((prev) => prev.filter((p) => p.jobId !== jobId));
    };

    const handleClose = () => {
        setVisible(false);
    };

    useEffect(() => {
        if (pending.length === 0) {
            setVisible(false);
        }
    }, [pending.length]);

    if (!visible || pending.length === 0) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
            <div className="mx-4 mb-6 w-full max-w-md rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-900 dark:text-gray-100 sm:mx-0">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                            Did you finish these applications?
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            We saw you clicked &quot;Apply&quot; from Transparency. Help keep
                            your profile accurate by confirming which ones you actually
                            submitted.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
                    {pending.map((app) => {
                        const job = app.job;
                        const isLoading = loadingIds.includes(app.jobId);

                        return (
                            <div
                                key={app.id}
                                className="flex flex-col rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="text-xs font-semibold text-gray-900 dark:text-gray-50">
                                    {job.title}
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-300">
                                    {job.company}
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleConfirm(app.jobId)}
                                        disabled={isLoading}
                                        className="inline-flex flex-1 items-center justify-center rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                        {isLoading ? "Saving..." : "Yes, I submitted"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleNotYet(app.jobId)}
                                        className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Not yet
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="mt-3 text-[10px] text-gray-400 dark:text-gray-500">
                    We never see your actual application answers — just whether you tell
                    us you submitted it.
                </p>
            </div>
        </div>
    );
}
