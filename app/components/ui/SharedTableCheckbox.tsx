import React from "react";
import { Check } from "lucide-react";

interface SharedTableCheckboxProps {
    checked: boolean;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    className?: string;
}

export default function SharedTableCheckbox({
    checked,
    onClick,
    className = "",
}: SharedTableCheckboxProps) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer mx-auto transition-colors ${
                checked
                    ? "bg-sai-pink border-sai-pink text-white"
                    : "border-neutral-300 bg-white hover:border-sai-pink"
            } ${className}`}
        >
            {checked && <Check className="w-3 h-3" />}
        </div>
    );
}
