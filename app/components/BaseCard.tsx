import React from 'react';
import Image from 'next/image';
import AllergenBadge from './AllergenBadge';

export interface BaseCardProps {
    // Content
    name: string;
    description?: string;
    category?: string;
    image_url?: string;
    tags?: string[];

    // Actions/Layout
    onClick?: () => void;
    footerContent?: React.ReactNode;
    displayMode?: 'grid' | 'list';

    // Optional styles
    className?: string;
}

export default function BaseCard({
    name,
    description,
    category,
    image_url,
    tags,
    onClick,
    footerContent,
    displayMode = 'grid',
    className = ''
}: BaseCardProps) {
    if (displayMode === 'list') {
        return (
            <article
                onClick={onClick}
                className={`flex gap-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4 cursor-pointer h-[140px] ${className}`}
                style={{ borderLeftColor: 'var(--color-sai-pink)' }}
            >
                {/* Compact Image - Full Height */}
                <div className="w-24 flex-shrink-0 bg-sai-white flex items-center justify-center">
                    {image_url ? (
                        <Image src={image_url} alt={name} width={96} height={200} className="object-cover w-full h-full" />
                    ) : (
                        <div className="text-xs text-gray-400">Image</div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
                    <div>
                        {category && (
                            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-sai-pink)' }}>
                                {category}
                            </div>
                        )}

                        <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-sai-pink-dark)', fontFamily: 'var(--font-serif)' }}>
                            {name}
                        </h3>

                        {description && (
                            <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                                {description}
                            </p>
                        )}

                        {/* Compact Allergen Tags */}
                        {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {tags.slice(0, 1).map((tag) => (
                                    <AllergenBadge key={tag} tag={tag} />
                                ))}
                                {tags.length > 1 && (
                                    <span className="text-xs text-gray-500">+{tags.length - 1}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Content */}
                    {footerContent && (
                        <div className="mt-auto w-full">
                            {footerContent}
                        </div>
                    )}
                </div>
            </article>
        );
    }

    // Default: Grid Layout
    return (
        <article
            onClick={onClick}
            className={`rounded-lg overflow-hidden bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer ${className}`}
            style={{ borderTop: `4px solid var(--color-sai-pink)` }}
        >
            {/* Image Placeholder - HEADER */}
            <div className="h-48 flex items-center justify-center bg-sai-white flex-shrink-0 relative">
                {image_url ? (
                    <Image src={image_url} alt={name} width={640} height={400} className="object-cover w-full h-full" />
                ) : (
                    <div className="text-sm text-gray-400">Image</div>
                )}
            </div>

            {/* Content Section - BODY (grows to fill space) */}
            <div className="p-6 flex flex-col flex-grow" style={{ backgroundColor: 'var(--color-sai-pink-light)' }}>
                {/* Category */}
                {category && (
                    <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-sai-pink)' }}>
                        {category}
                    </div>
                )}

                {/* Product Name */}
                <h3 className="text-xl font-bold mb-2 break-words" style={{ color: 'var(--color-sai-pink-dark)', fontFamily: 'var(--font-serif)' }}>
                    {name}
                </h3>

                {/* Description - fixed 2 lines */}
                {description && (
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
                )}

                {/* Allergen Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {tags.map((tag) => (
                            <AllergenBadge key={tag} tag={tag} />
                        ))}
                    </div>
                )}

                {/* Spacer to push footer to bottom */}
                <div className="flex-grow" />

                {/* FOOTER - Price and Button (always at bottom) */}
                {footerContent && (
                    <div className="mt-auto w-full">
                        {footerContent}
                    </div>
                )}
            </div>
        </article>
    );
}
