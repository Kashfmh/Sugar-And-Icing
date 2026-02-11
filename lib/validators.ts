
export function isValidEmail(email: string): boolean {
    // Basic email regex + no spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    // Strict Malaysian phone validation
    // Must start with +60
    // Followed by 1
    // Followed by 0-9 (with specific breakdown usually 011 is 8 digits, others 7)
    // But user asked for: +601123776040 (11 digits after +60? No wait. 
    // +60 11 2377 6040 -> 2+8 = 10 digits?
    // Let's re-read user request: +601123776040
    // +60 is prefix. 11 2377 6040 is the number.
    // 11 is the prefix for 011 numbers. 
    // 23776040 is 8 digits.
    // So 011-xxxxxxxx (8 digits) = 11 digits total.
    // Normal mobile: 012-xxxxxxx (7 digits) = 10 digits total.
    // So excluding +60, we expect 9 or 10 digits?
    // No, +60 replace 0.
    // 011-xxx -> +6011-xxx
    // Length: +60 + 9 to 10 digits.
    // User request: "valid +60 number for example +601123776040"
    // +60 + 11 + 23776040 (10 digits after +60)
    // Total length 13 chars including +

    // Regex: ^\+601[0-9]{8,9}$ 
    // ^ start
    // \+60 literal +60
    // 1 must follow (01x)
    // [0-9] digits
    // {8,9} count: 
    // 012-1234567 -> +60121234567 (9 digits after +60)
    // 011-12345678 -> +601112345678 (10 digits after +60)

    // Also user said "no spaces allat".

    const phoneRegex = /^\+601[0-9]{8,9}$/;
    return phoneRegex.test(phone);
}


export function isValidName(name: string): boolean {
    const trimmed = name.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.length > 50) return false;
    // Only allow letters and spaces
    return /^[a-zA-Z\s]+$/.test(trimmed);
}

export function formatPhone(phone: string): string {
    return phone.trim();
}
