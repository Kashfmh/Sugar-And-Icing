'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
    words: string[];
    className?: string;
}

export function AnimatedText({ words, className = "" }: AnimatedTextProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % words.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className="relative inline-block overflow-hidden w-[280px] sm:w-[400px] md:w-[500px]" style={{ minHeight: '1.2em' }}>
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    className={`absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap ${className}`}
                    initial={{ opacity: 0, y: "-100%" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                        currentIndex === index
                            ? { y: 0, opacity: 1 }
                            : { y: currentIndex > index ? "150%" : "150%", opacity: 0 }
                    }
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}
