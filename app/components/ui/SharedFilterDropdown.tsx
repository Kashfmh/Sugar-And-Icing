import { ChevronDown, Filter } from 'lucide-react';
import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FilterOption {
    label: string;
    value: string;
}

interface SharedFilterDropdownProps {
    options: FilterOption[];
    activeValue: string;
    onFilterChange: (value: string) => void;
    align?: "start" | "center" | "end";
    triggerLabel?: string;
    triggerIcon?: React.ReactNode;
}

export default function SharedFilterDropdown({
    options,
    activeValue,
    onFilterChange,
    align = "end",
    triggerLabel,
    triggerIcon
}: SharedFilterDropdownProps) {
    const activeOption = options.find(o => o.value === activeValue);
    const displayLabel = triggerLabel || activeOption?.label || "Filter";
    const icon = triggerIcon !== undefined ? triggerIcon : <Filter className="w-4 h-4 text-gray-500" />;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {triggerLabel || (triggerIcon && !triggerLabel === false) ? (
                    <button className="flex items-center justify-between gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-sai-pink/20 transition-all font-medium text-sm text-sai-charcoal h-[42px] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            {triggerIcon}
                            <span>{displayLabel}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                    </button>
                ) : (
                    <button className="flex items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:border-sai-pink/50 focus:outline-none focus:ring-2 focus:ring-sai-pink/20 transition-all min-w-[42px] h-[42px]">
                        {icon}
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-1 z-50">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => onFilterChange(option.value)}
                        className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors ${activeValue === option.value
                            ? 'bg-pink-50 text-sai-pink font-medium'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-sai-pink'
                            }`}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
