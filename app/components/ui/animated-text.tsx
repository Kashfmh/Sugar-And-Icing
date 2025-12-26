'use client';

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
    words: string[];
    className?: string;
}

export function AnimatedText({ words, className = "" }: AnimatedTextProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const titles = useMemo(() => words, [words]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentIndex === titles.length - 1) {
                setCurrentIndex(0);
            } else {
                setCurrentIndex(currentIndex + 1);
            }
        }, 2500); // Change every 2.5 seconds
        return () => clearTimeout(timeoutId);
    }, [currentIndex, titles]);

    return (
        <span className="relative flex w-full justify-center overflow-hidden text-center">
            &nbsp;
            {titles.map((title, index) => (
                <motion.span
                    key={index}
                    className={`absolute font-semibold ${className}`}
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                        currentIndex === index
                            ? {
                                y: 0,
                                opacity: 1,
                            }
                            : {
                                y: currentIndex > index ? -150 : 150,
                                opacity: 0,
                            }
                    }
                >
                    {title}
                </motion.span>
            ))}
        </span>
    );
}
