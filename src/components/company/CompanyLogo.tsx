// src/components/CompanyLogo.tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';
import { COMPANY_DOMAINS } from '@/lib/companyDomains';

function initials(name: string) {
    return (name || '?').split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function CompanyLogo({
    slug, name, domain, size = 24, className = '',
}: { slug: string; name: string; domain?: string | null; size?: number; className?: string; }) {
    const d = domain || COMPANY_DOMAINS[slug] || '';
    const [useFavicon, setUseFavicon] = useState(false);
    const [broken, setBroken] = useState(false);

    if (!d || broken) {
        return (
            <div
                className={`inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 ${className}`}
                style={{ width: size, height: size, fontSize: Math.max(10, Math.floor(size * 0.45)) }}
                title={name}
            >
                {initials(name)}
            </div>
        );
    }

    const clearbit = `https://logo.clearbit.com/${d}`;
    const favicon = `https://www.google.com/s2/favicons?domain=${d}&sz=${size * 2}`;
    const src = useFavicon ? favicon : clearbit;

    return (
        <Image
            src={src}
            alt={`${name} logo`}
            width={size}
            height={size}
            className={`rounded ${className}`}
            style={{ objectFit: 'contain' }}
            onError={() => (useFavicon ? setBroken(true) : setUseFavicon(true))}
        />
    );
}
