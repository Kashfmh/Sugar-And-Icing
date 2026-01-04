import React from 'react';
import { MessageCircle } from 'lucide-react';
import BaseCard from './BaseCard';

interface Props {
    name: string;
    description?: string;
    image_url?: string;
    onRequestQuote: () => void;
}

export default function GalleryCard({ name, description, image_url, onRequestQuote }: Props) {
    const footerContent = (
        <button
            onClick={onRequestQuote}
            className="w-full px-6 py-2 rounded-full text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-sai-pink)' }}
            aria-label={`Request custom quote for ${name}`}
        >
            <MessageCircle className="w-4 h-4" />
            Request Custom Quote
        </button>
    );

    return (
        <BaseCard
            name={name}
            description={description}
            image_url={image_url}
            footerContent={footerContent}
            displayMode="grid"
        />
    );
}
