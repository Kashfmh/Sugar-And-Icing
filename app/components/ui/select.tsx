'use client';

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: { value: string; label: string }[];
    className?: string;
}

export function Select({ value, onChange, options, className }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className={cn("relative inline-block", className)} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between min-w-[180px]"
            >
                <span>{selectedOption?.label}</span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={cn(
                                "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                                option.value === value && "bg-sai-pink/10 text-sai-pink font-medium"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
