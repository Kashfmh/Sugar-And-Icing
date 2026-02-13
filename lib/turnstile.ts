export async function verifyTurnstileToken(token: string): Promise<boolean> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
        console.error('TURNSTILE_SECRET_KEY is not set');
        return false;
    }

    try {
        const formData = new FormData();
        formData.append('secret', secretKey);
        formData.append('response', token);

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const outcome = await result.json();
        return outcome.success;
    } catch (e) {
        console.error('Turnstile verification failed:', e);
        return false;
    }
}
