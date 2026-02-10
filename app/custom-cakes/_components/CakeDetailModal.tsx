'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import CakeDetailContent from './CakeDetailContent';

interface CakeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    cakeName: string;
    imageUrl?: string;
    description?: string;
}

export default function CakeDetailModal({
    isOpen,
    onClose,
    cakeName,
    imageUrl,
    description
}: CakeDetailModalProps) {

    // lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] md:h-[600px]"
                    >
                        {/* Mobile Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full md:hidden text-gray-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <CakeDetailContent
                            cakeName={cakeName}
                            imageUrl={imageUrl}
                            description={description}
                            onClose={onClose}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
