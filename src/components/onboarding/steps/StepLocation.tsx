"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useOnboarding } from "../OnboardingContext";
import { savePartial } from "@/app/onboarding/actions";

type Suggestion = {
    id: string;
    place_name: string;
};

export default function StepLocation() {
    const { data, setData, back, next } = useOnboarding();
    const [query, setQuery] = useState(data.location ?? "");
    const [open, setOpen] = useState(false);
    const [idx, setIdx] = useState<number>(-1);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [err, setErr] = useState<string | null>(null);
    const [pending, start] = useTransition();
    const listRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // basic debounce
    const debouncedQuery = useDebounce(query, 200);

    useEffect(() => {
        let stop = false;
        async function run() {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setSuggestions([]);
                return;
            }
            const r = await fetch(`/api/geo/places?q=${encodeURIComponent(debouncedQuery)}`);
            if (!r.ok) return;
            const j = await r.json();
            if (stop) return;
            const feats = (j?.features ?? []) as any[];
            setSuggestions(
                feats.map((f) => ({ id: f.id as string, place_name: f.place_name as string }))
            );
            setOpen(true);
            setIdx(-1);
        }
        run();
        return () => {
            stop = true;
        };
    }, [debouncedQuery]);

    function pick(s: Suggestion) {
        setQuery(s.place_name);
        setOpen(false);
        setIdx(-1);
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!open || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIdx((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            if (idx >= 0) {
                e.preventDefault();
                pick(suggestions[idx]);
            } else {
                setOpen(false);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    const submit = () => {
        const v = query.trim();
        if (!v) return setErr("Please enter a location");
        setErr(null);
        setData({ location: v });
        start(async () => {
            await savePartial({ location: v });
            next();
        });
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">Where are you located?</h2>
            <div className="relative">
                <input
                    ref={inputRef}
                    className="mb-1 w-full rounded-xl border px-3 py-2"
                    placeholder="City, Region, Country"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={onKeyDown}
                    autoFocus
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls="loc-suggest"
                    role="combobox"
                />
                {open && suggestions.length > 0 && (
                    <ul
                        id="loc-suggest"
                        ref={listRef}
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        role="listbox"
                    >
                        {suggestions.map((s, i) => (
                            <li
                                key={s.id}
                                role="option"
                                aria-selected={i === idx}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => pick(s)}
                                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${i === idx ? "bg-gray-100 dark:bg-gray-700" : ""
                                    }`}
                            >
                                {s.place_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {err && <p className="mb-3 text-sm text-red-500">{err}</p>}
            <div className="mt-2 flex gap-2">
                <button onClick={back} className="flex-1 rounded-xl border px-4 py-3">
                    Back
                </button>
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

// small debounce hook
function useDebounce<T>(value: T, ms = 250) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
}
