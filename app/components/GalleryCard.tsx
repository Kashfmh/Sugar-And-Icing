import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';

interface Props {
    name: string;
    description?: string;
    image_url?: string;
    onRequestQuote: () => void;
}

export default function GalleryCard({ name, description, image_url, onRequestQuote }: Props) {
    return (
        <article
            className="rounded-lg overflow-hidden bg-white flex flex-col shadow-soft hover:shadow-md transition-shadow h-full"
            style={{ borderTop: `4px solid var(--color-sai-pink)` }}
        >
            {/* Image - Fixed Height */}
            <div className="h-48 flex items-center justify-center bg-sai-white flex-shrink-0">
                {image_url ? (
                    <Image src={image_url} alt={name} width={640} height={400} className="object-cover w-full h-full" />
                ) : (
                    <div className="text-sm text-gray-400">Gallery Image</div>
                )}
            </div>

            {/* Content Section - Grows to fill space */}
            <div className="p-6 flex flex-col flex-grow" style={{ backgroundColor: 'var(--color-sai-pink-light)' }}>
                {/* Product Name */}
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-sai-pink-dark)', fontFamily: 'var(--font-serif)' }}>
                    {name}
                </h3>

                {/* Description - fixed 2 lines */}
                <p
                    className="text-sm mb-4 line-clamp-2"
                    style={{
                        color: 'var(--color-sai-text-gray)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '3em',
                        maxHeight: '3em'
                    }}
                    title={description}
                >
                    {description}
                </p>

                {/* Spacer to push footer to bottom */}
                <div className="flex-grow" />

                {/* Footer - Request Quote Button (always at bottom) */}
                <div className="mt-auto">
                    <button
                        onClick={onRequestQuote}
                        className="w-full px-6 py-2 rounded-full text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'var(--color-sai-pink)' }}
                        aria-label={`Request custom quote for ${name}`}
                    >
                        <MessageCircle className="w-4 h-4" />
                        Request Custom Quote
                    </button>
                </div>
            </div>
        </article>
    );
}
