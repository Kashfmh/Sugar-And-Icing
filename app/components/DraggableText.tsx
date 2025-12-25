'use client';

import { useEffect, useRef } from 'react';

export default function DraggableText() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const letters = container.querySelectorAll('.draggable-letter');

        letters.forEach((letter) => {
            let isDragging = false;
            let currentX = 0;
            let currentY = 0;
            let initialX = 0;
            let initialY = 0;
            let xOffset = 0;
            let yOffset = 0;

            const dragStart = (e: MouseEvent) => {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === letter) {
                    isDragging = true;
                    (letter as HTMLElement).style.cursor = 'grabbing';
                }
            };

            const dragEnd = () => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                (letter as HTMLElement).style.cursor = 'grab';
            };

            const drag = (e: MouseEvent) => {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    (letter as HTMLElement).style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
            };

            letter.addEventListener('mousedown', dragStart as EventListener);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('mousemove', drag as EventListener);

            return () => {
                letter.removeEventListener('mousedown', dragStart as EventListener);
                document.removeEventListener('mouseup', dragEnd);
                document.removeEventListener('mousemove', drag as EventListener);
            };
        });
    }, []);

    const text = 'Sugar And Icing';
    const subtitle = 'Baked Fresh For You.';

    return (
        <div ref={containerRef} className="select-none">
            {/* Main Title - Draggable Letters */}
            <h1 className="font-serif text-6xl md:text-7xl font-normal leading-[1.1] mb-4 text-sai-charcoal">
                {text.split('').map((char, index) => (
                    <span
                        key={index}
                        className="draggable-letter inline-block cursor-grab hover:text-sai-pink transition-colors"
                        style={{ display: 'inline-block' }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </h1>

            {/* Subtitle - All on one line, draggable */}
            <h2 className="font-serif text-5xl md:text-6xl font-normal leading-[1.1] mb-8 text-sai-charcoal">
                {subtitle.split('').map((char, index) => (
                    <span
                        key={index}
                        className="draggable-letter inline-block cursor-grab hover:text-sai-pink transition-colors"
                        style={{ display: 'inline-block' }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </h2>
        </div>
    );
}
