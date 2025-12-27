export default function AllergenBadge({ tag }: { tag: string }) {
    // Format tag for display (remove hyphens, capitalize)
    const displayText = tag
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    // Color coding based on tag type
    const isWarning = tag.startsWith('contains-');
    const isAvailable = tag.endsWith('-available');

    const colorClasses = isWarning
        ? 'bg-red-50 text-red-700 border-red-200'
        : isAvailable
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-gray-50 text-gray-700 border-gray-200';

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}
        >
            {displayText}
        </span>
    );
}
