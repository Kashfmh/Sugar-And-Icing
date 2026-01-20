'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { uploadAvatar, deleteAvatar } from '@/lib/services/profileService';

interface AvatarUploadProps {
    userId: string;
    currentAvatarUrl: string | null;
    onAvatarUpdate: (newUrl: string | null) => void;
}

export default function AvatarUpload({ userId, currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        if (file.size > 5 * 1024 * 1024) {
            setError('File size too large. Maximum 5MB allowed.');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        setError(null);

        const result = await uploadAvatar(file, userId);

        if (result.success && result.url) {
            setPreview(result.url);
            onAvatarUpdate(result.url);
        } else {
            setError(result.error || 'Failed to upload avatar');
            setPreview(currentAvatarUrl);
        }

        setUploading(false);
    };

    const handleDelete = async () => {
        if (!confirm('Remove profile picture?')) return;

        setUploading(true);
        setError(null);

        const result = await deleteAvatar(userId);

        if (result.success) {
            setPreview(null);
            onAvatarUpdate(null);
        } else {
            setError(result.error || 'Failed to delete avatar');
        }

        setUploading(false);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-sai-pink/20 to-sai-pink/10 border-4 border-white shadow-lg">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Profile"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-sai-pink">
                            <Camera className="w-12 h-12" />
                        </div>
                    )}
                </div>

                {/* Overlay on hover */}
                {!uploading && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                        <Upload className="w-6 h-6" />
                    </button>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-sai-pink text-white rounded-lg text-sm font-medium hover:bg-sai-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {preview ? 'Change Photo' : 'Upload Photo'}
                </button>

                {preview && (
                    <button
                        onClick={handleDelete}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Remove
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
                JPEG, PNG or WebP. Max 5MB.
            </p>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
            />
        </div>
    );
}
