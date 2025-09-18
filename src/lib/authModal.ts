// src/lib/authModal.ts
export type AuthMode = "login" | "signup";
const EVENT = "transparency:open-auth";

export function openAuthModal(mode: AuthMode) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(EVENT, { detail: { mode } }));
    }
}

export function listenAuthModal(cb: (mode: AuthMode) => void) {
    const handler = (e: Event) => {
        const ce = e as CustomEvent<{ mode: AuthMode }>;
        if (ce.detail?.mode) cb(ce.detail.mode);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
}
