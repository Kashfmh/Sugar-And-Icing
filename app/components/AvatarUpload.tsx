'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { uploadAvatar, deleteAvatar } from '@/lib/services/profileService';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

// CSS to make the square crop box look circular to the user
const circleCropStyle = `
  .cropper-view-box, .cropper-face {
    border-radius: 50%;
  }
  .cropper-view-box {
    outline: 0;
    box-shadow: 0 0 0 1px #39f;
  }
`;

interface AvatarUploadProps {
    userId: string;
    currentAvatarUrl: string | null;
    onAvatarUpdate: (newUrl: string | null) => void;
}

export default function AvatarUpload({ userId, currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cropperRef = useRef<ReactCropperElement>(null);

    // State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // 1. Validation
            if (file.size > 5 * 1024 * 1024) {
                setError('File size too large. Maximum 5MB allowed.');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
                return;
            }

            // 2. Read File
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
            
            // Reset input
            e.target.value = '';
        }
    };

    const handleSaveCrop = async () => {
        if (!cropperRef.current) return;
        
        try {
            setUploading(true);
            const cropper = cropperRef.current?.cropper;
            
            // 1. Get the cropped canvas (Square)
            const canvas = cropper.getCroppedCanvas({
                width: 500,
                height: 500,
                imageSmoothingQuality: 'high',
            });

            // 2. Convert to Blob
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    setError('Failed to create image.');
                    setUploading(false);
                    return;
                }

                // 3. Create File and Upload
                const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                await handleUpload(file);
                
                // Cleanup
                setShowCropModal(false);
                setImageSrc(null);
            }, 'image/jpeg', 0.95);

        } catch (e) {
            console.error(e);
            setError('Failed to crop image.');
            setUploading(false);
        }
    };

    const handleUpload = async (file: File) => {
        setError(null);
        const result = await uploadAvatar(file, userId);

        if (result.success && result.url) {
            // Timestamp to bust cache
            const timestampUrl = `${result.url}?t=${Date.now()}`;
            setPreview(timestampUrl);
            onAvatarUpdate(timestampUrl);
            window.dispatchEvent(new Event('profile-updated'));
        } else {
            console.error(result.error);
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
            {/* Inject styles for the circular crop box */}
            <style>{circleCropStyle}</style>

            {/* Avatar Preview */}
            <div className="relative group">
                <div className="w-32 h-32 relative rounded-full overflow-hidden bg-white border-4 border-white shadow-lg shrink-0">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Profile"
                            fill
                            className="object-cover"
                            unoptimized // Important for timestamp URLs
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

            {/* Buttons */}
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
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-sai-charcoal">Adjust Photo</h3>
                            <button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative h-80 w-full bg-black/90">
                            <Cropper
                                src={imageSrc}
                                style={{ height: '100%', width: '100%' }}
                                initialAspectRatio={1}
                                aspectRatio={1}
                                guides={false}
                                viewMode={1}
                                dragMode="move"
                                cropBoxMovable={false}
                                cropBoxResizable={false}
                                toggleDragModeOnDblclick={false}
                                background={false}
                                ref={cropperRef}
                            />
                        </div>

                        <div className="p-6 flex justify-between items-center bg-white">
                            <div className="flex gap-2">
                                <button onClick={() => cropperRef.current?.cropper.zoom(0.1)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" type="button">
                                    <ZoomIn className="w-5 h-5 text-gray-600" />
                                </button>
                                <button onClick={() => cropperRef.current?.cropper.zoom(-0.1)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" type="button">
                                    <ZoomOut className="w-5 h-5 text-gray-600" />
                                </button>
                                <button onClick={() => cropperRef.current?.cropper.rotate(90)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" type="button">
                                    <RotateCw className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            <button
                                onClick={handleSaveCrop}
                                disabled={uploading}
                                className="px-6 py-2 bg-sai-pink text-white font-medium rounded-lg hover:bg-sai-pink/90 transition-colors flex items-center gap-2"
                            >
                                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Set Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-bold text-sai-charcoal mb-2">Remove Profile Picture?</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to remove your profile picture? This cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}