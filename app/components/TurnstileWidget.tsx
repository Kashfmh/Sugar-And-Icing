'use client';

import { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    theme?: 'light' | 'dark' | 'auto';
    retry?: 'auto' | 'never';
}

export default function TurnstileWidget({ onVerify, theme = 'auto', retry = 'never' }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        if (document.getElementById('turnstile-script')) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.id = 'turnstile-script';
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!scriptLoaded || !containerRef.current || !window.turnstile) return;

        const widgetId = window.turnstile.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
            theme,
            retry, // Tells Cloudflare not to loop if the invisible check fails
            callback: (token: string) => {
                onVerify(token);
            },
        });

        return () => {
            if (window.turnstile) {
                window.turnstile.remove(widgetId);
            }
        };
    }, [scriptLoaded, onVerify, theme, retry]);

    return <div ref={containerRef} className="my-4" />;
}

// Add types for window.turnstile
declare global {
    interface Window {
        turnstile: {
            render: (
                container: HTMLElement | string,
                options: {
                    sitekey: string;
                    theme?: 'light' | 'dark' | 'auto';
                    retry?: 'auto' | 'never';
                    callback?: (token: string) => void;
                }
            ) => string;
            remove: (widgetId: string) => void;
        };
    }
}