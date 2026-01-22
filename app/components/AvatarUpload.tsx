'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { Camera, Upload, X, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { uploadAvatar, deleteAvatar } from '@/lib/services/profileService';
import getCroppedImg from '@/lib/utils/canvasUtils';

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

    // Cropping State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [showCropModal, setShowCropModal] = useState(false);

    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropChange = (location: { x: number; y: number }) => {
        // Manual clamp to prevent "infinite" panning (losing the image)
        // while allowing smooth "loose" movement.
        const LIMIT = 250;
        const x = Math.max(-LIMIT, Math.min(LIMIT, location.x));
        const y = Math.max(-LIMIT, Math.min(LIMIT, location.y));
        setCrop({ x, y });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

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

            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || '');
                setShowCropModal(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setUploading(true);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            if (!croppedImageBlob) {
                throw new Error('Could not crop image');
            }

            // Create a File from Blob to send to upload service
            const file = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' });

            await handleUpload(file);

            // Clean up
            setShowCropModal(false);
            setImageSrc(null);
            setZoom(1);
        } catch (e) {
            console.error(e);
            setError('Failed to crop image');
            setUploading(false);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        setError(null);

        const result = await uploadAvatar(file, userId);

        if (result.success && result.url) {
            setPreview(result.url);
            onAvatarUpdate(result.url);
            window.dispatchEvent(new Event('profile-updated'));
        } else {
            console.error('[AvatarUpload] Error:', result.error);
            setError('Failed to upload image. Please try again later.');
        }

        setUploading(false);
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);
        setUploading(true);
        setError(null);

        const result = await deleteAvatar(userId);

        if (result.success) {
            setPreview(null);
            onAvatarUpdate(null);
            window.dispatchEvent(new Event('profile-updated'));
        } else {
            setError(result.error || 'Failed to delete avatar');
        }

        setUploading(false);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative group">
                <div className="w-32 h-32 relative rounded-full overflow-hidden bg-white border-4 border-white shadow-lg shrink-0">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Profile"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sai-pink/20 to-sai-pink/10">
                            <Camera className="w-12 h-12 text-sai-pink" />
                        </div>
                    )}
                </div>

                {!uploading && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-10"
                    >
                        <Upload className="w-6 h-6" />
                    </button>
                )}

                {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center z-20">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

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
                        onClick={() => setShowDeleteModal(true)}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Remove
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <p className="text-xs text-gray-500 text-center">
                JPEG, PNG or WebP. Max 5MB.
            </p>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Crop Modal */}
            {showCropModal && imageSrc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-sai-charcoal">Adjust Photo</h3>
                            <button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative h-64 w-full bg-gray-100 overflow-hidden rounded-lg touch-none">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={handleCropChange}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={true}
                                objectFit="contain"
                                restrictPosition={false}
                                minZoom={1}
                                maxZoom={3}
                            />
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <ZoomOut className="w-5 h-5 text-gray-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.01}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sai-pink touch-none"
                                />
                                <ZoomIn className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowCropModal(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveCrop}
                                    disabled={uploading}
                                    className="px-6 py-2 bg-sai-pink text-white font-medium rounded-lg hover:bg-sai-pink/90 transition-colors flex items-center gap-2"
                                >
                                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Set Profile Picture
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-sai-charcoal mb-2">Remove Profile Picture?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to remove your profile picture? This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
