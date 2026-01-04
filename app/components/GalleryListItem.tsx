import React from 'react';
import { MessageCircle } from 'lucide-react';
import BaseCard from './BaseCard';

interface Props {
    name: string;
    description?: string;
    image_url?: string;
    onRequestQuote: () => void;
}

export default function GalleryListItem({ name, description, image_url, onRequestQuote }: Props) {
    const footerContent = (
        <button
            onClick={onRequestQuote}
            className="self-start px-3 py-1.5 rounded-full text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
            style={{ backgroundColor: 'var(--color-sai-pink)' }}
        >
            <MessageCircle className="w-3 h-3" />
            Quote
        </button>
    );

    return (
        <BaseCard
            name={name}
            description={description}
            image_url={image_url}
            footerContent={footerContent}
            displayMode="list"
        />
    );
}
