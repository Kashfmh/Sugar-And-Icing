import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';

interface Props {
    name: string;
    description?: string;
    image_url?: string;
    onRequestQuote: () => void;
}

export default function GalleryListItem({ name, description, image_url, onRequestQuote }: Props) {
    return (
        <article className="flex gap-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: 'var(--color-sai-pink)' }}>
            {/* Compact Image */}
            <div className="w-24 flex-shrink-0 bg-sai-white flex items-center justify-center">
                {image_url ? (
                    <Image src={image_url} alt={name} width={96} height={200} className="object-cover w-full h-full" />
                ) : (
                    <div className="text-xs text-gray-400">Image</div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 py-3 pr-3 flex flex-col">
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-sai-pink-dark)', fontFamily: 'var(--font-serif)' }}>
                    {name}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-grow">
                    {description}
                </p>

                {/* Compact Quote Button */}
                <button
                    onClick={onRequestQuote}
                    className="self-start px-3 py-1.5 rounded-full text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                    style={{ backgroundColor: 'var(--color-sai-pink)' }}
                >
                    <MessageCircle className="w-3 h-3" />
                    Quote
                </button>
            </div>
        </article>
    );
}
