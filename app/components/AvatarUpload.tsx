'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Camera, Upload, X, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
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

    // Cropping State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const cropperRef = useRef<ReactCropperElement>(null);
    const [zoom, setZoom] = useState(1);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
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
            e.target.value = ''; // Reset input
        }
    };

    // Sync zoom state with cropper (Cropper v1.x)
    const handleCropperZoom = useCallback(() => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) setZoom(cropper.getData().scaleX || 1);
    }, []);

    const handleZoomSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setZoom(value);
        cropperRef.current?.cropper.zoomTo(value);
    };

    const handleZoomIn = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const currentZoom = cropper.getData().scaleX || 1;
            const newZoom = Math.min(currentZoom + 0.1, 3);
            cropper.zoomTo(newZoom);
            setZoom(newZoom);
        }
    };

    const handleZoomOut = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const currentZoom = cropper.getData().scaleX || 1;
            const newZoom = Math.max(currentZoom - 0.1, 0.1);
            cropper.zoomTo(newZoom);
            setZoom(newZoom);
        }
    };

    const handleSaveCrop = async () => {
        if (!cropperRef.current?.cropper) {
            setError('Cropper not initialized');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            // Get the cropped canvas from Cropper.js
            const canvas = cropperRef.current.cropper.getCroppedCanvas({
                width: 400,
                height: 400,
                imageSmoothingQuality: 'high',
            });

            if (!canvas) {
                throw new Error('Could not get cropped canvas');
            }

            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas to Blob conversion failed'));
                    },
                    'image/jpeg',
                    0.95
                );
            });

            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            await handleUpload(file);

            setShowCropModal(false);
            setImageSrc(null);
        } catch (e) {
            console.error(e);
            setError('Failed to crop image. Please try again.');
            setUploading(false);
        }
    };

    const handleUpload = async (file: File) => {
        setError(null);
        const result = await uploadAvatar(file, userId);
        if (result.success && result.url) {
            // Add timestamp to bypass browser caching of the old image
            const timestampUrl = `${result.url}?t=${Date.now()}`;
            setPreview(timestampUrl);
            onAvatarUpdate(timestampUrl);
            window.dispatchEvent(new Event('profile-updated'));
        } else {
            setError('Failed to upload image. Please try again later.');
        }
        setUploading(false);
    };

    const handleDelete = async () => {
        try {
            setUploading(true);
            const result = await deleteAvatar(userId);
            if (result.success) {
                setPreview(null);
                onAvatarUpdate(null);
                window.dispatchEvent(new Event('profile-updated'));
            } else {
                setError('Failed to delete avatar.');
            }
        } catch (e) {
            setError('Failed to delete avatar.');
        } finally {
            setUploading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Preview Circle */}
            <div className="relative group">
                <div className="w-32 h-32 relative rounded-full overflow-hidden bg-white border-4 border-white shadow-lg shrink-0">
                    {preview ? (
                        <Image src={preview} alt="Profile" fill className="object-cover" unoptimized />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sai-pink/20 to-sai-pink/10">
                            <Camera className="w-12 h-12 text-sai-pink" />
                        </div>
                    )}
                </div>
                {!uploading && (
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-10">
                        <Upload className="w-6 h-6" />
                    </button>
                )}
                {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center z-20">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-sai-pink text-white rounded-lg text-sm font-medium hover:bg-sai-pink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {preview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {preview && (
                    <button onClick={() => setShowDeleteModal(true)} disabled={uploading} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <X className="w-4 h-4" /> Remove
                    </button>
                )}
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />

            {/* Crop Modal - Fixed Circle Mode (Instagram/Twitter Style) */}
            {showCropModal && imageSrc && (
                <>
                    <style jsx global>{`
                        .cropper-view-box {
                            border-radius: 50% !important;
                            outline: 3px solid rgba(255, 255, 255, 0.9) !important;
                            outline-offset: -1px;
                            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6) !important;
                        }
                        .cropper-face {
                            background-color: transparent !important;
                        }
                        .cropper-point,
                        .cropper-line {
                            display: none !important;
                        }
                    `}</style>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-sai-charcoal">Adjust Your Profile Photo</h3>
                                    <p className="text-sm text-gray-500 mt-1">Drag to reposition • Scroll to zoom</p>
                                </div>
                                <button onClick={() => setShowCropModal(false)} className="hover:bg-gray-100 p-2 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Cropper Container - Fixed Circle with Image Behind */}
                            <div className="relative h-[400px] w-full bg-gray-900 overflow-hidden">
                                <Cropper
                                    src={imageSrc}
                                    style={{ height: '100%', width: '100%' }}
                                    aspectRatio={1}
                                    viewMode={1}
                                    dragMode="move"
                                    cropBoxMovable={false}
                                    cropBoxResizable={false}
                                    guides={false}
                                    background={false}
                                    autoCropArea={0.8}
                                    checkOrientation={true}
                                    responsive={true}
                                    ref={cropperRef}
                                    zoomTo={zoom}
                                    crop={handleCropperZoom}
                                />
                            </div>

                            <div className="p-6 space-y-6 bg-gray-50">
                                {/* Zoom Control */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Zoom Level</label>
                                    <div className="flex items-center gap-4">
                                        <ZoomOut
                                            className="w-5 h-5 text-gray-400 flex-shrink-0 cursor-pointer hover:text-gray-600 transition-colors"
                                            onClick={handleZoomOut}
                                        />
                                        <input
                                            type="range"
                                            min={0.1}
                                            max={3}
                                            step={0.01}
                                            value={zoom}
                                            onChange={handleZoomSlider}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sai-pink [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sai-pink [&::-webkit-slider-thumb]:cursor-pointer"
                                        />
                                        <ZoomIn
                                            className="w-5 h-5 text-gray-400 flex-shrink-0 cursor-pointer hover:text-gray-600 transition-colors"
                                            onClick={handleZoomIn}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowCropModal(false)}
                                        className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 bg-white border border-gray-300 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveCrop}
                                        disabled={uploading}
                                        className="px-6 py-2.5 bg-sai-pink text-white font-medium rounded-lg hover:bg-sai-pink/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-sai-pink/30"
                                    >
                                        {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Set Profile Picture
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="font-bold text-xl text-sai-charcoal mb-2">Remove Profile Picture?</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to remove your profile picture?</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={uploading}
                                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 bg-white border border-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={uploading}
                                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                            >
                                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}