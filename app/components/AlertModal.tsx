'use client';

import { X, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success' | 'confirm' | 'delete';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel'
}: AlertModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const renderIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle className="w-12 h-12 text-red-500 bg-red-100 p-2 rounded-full" />;
            case 'success': return <CheckCircle className="w-12 h-12 text-green-500 bg-green-100 p-2 rounded-full" />;
            case 'delete': return <Trash2 className="w-12 h-12 text-red-500 bg-red-100 p-2 rounded-full" />;
            case 'confirm': return <AlertCircle className="w-12 h-12 text-blue-500 bg-blue-100 p-2 rounded-full" />;
            default: return <AlertCircle className="w-12 h-12 text-sai-pink bg-pink-100 p-2 rounded-full" />;
        }
    };

    return (
        <div className={`fixed inset-0 z-[1200] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className={`bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative z-10 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                        {renderIcon()}
                    </div>

                    <h3 className="text-xl font-bold text-sai-charcoal mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        {(type === 'confirm' || type === 'delete') && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                if (onConfirm) onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2 text-white font-semibold rounded-xl shadow-lg transition-transform active:scale-95 ${type === 'delete' || type === 'error'
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                : 'bg-sai-pink hover:bg-sai-pink/90 shadow-pink-200'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
