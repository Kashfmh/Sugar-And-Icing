'use client';

import React, { useEffect, useState } from 'react';

// Converts a string to HTML entities to hide from simple scrapers
const obfuscateString = (str: string) => {
    return str.split('').map(char => `&#${char.charCodeAt(0)};`).join('');
};

interface ObfuscatedEmailProps {
    email: string;
    className?: string;
}

export default function ObfuscatedEmail({ email, className }: ObfuscatedEmailProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // We render a safely obfuscated span on server, and hydrate with the interactive link on client
    // By keeping it as a span until JS runs, bots mostly see garbage HTML entities
    if (!mounted) {
        return (
            <span
                className={className}
                dangerouslySetInnerHTML={{ __html: obfuscateString(email) }}
            />
        );
    }

    return (
        <a
            href={`mailto:${email}`}
            className={className}
        >
            {email}
        </a>
    );
}
