import { supabase } from '@/lib/supabase';
import { updateUserProfile } from './authService';

// upload avatar
export async function uploadAvatar(
    file: File,
    userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // max 5mb
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return { success: false, error: 'File size too large. Maximum 5MB allowed.' };
        }

        // validate type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
        }

        // generate filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        // delete old avatar
        const { data: oldFiles } = await supabase.storage
            .from('avatars')
            .list(userId);

        if (oldFiles && oldFiles.length > 0) {
            const filesToDelete = oldFiles.map(f => `${userId}/${f.name}`);
            await supabase.storage
                .from('avatars')
                .remove(filesToDelete);
        }

        // upload new
        const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return { success: false, error: uploadError.message };
        }

        // get public url
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        // update profile
        await updateUserProfile(userId, { avatar_url: publicUrl });

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error('Error uploading avatar:', error);
        return { success: false, error: error.message || 'Failed to upload avatar' };
    }
}

// delete avatar
export async function deleteAvatar(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // list files
        const { data: files } = await supabase.storage
            .from('avatars')
            .list(userId);

        if (files && files.length > 0) {
            const filesToDelete = files.map(f => `${userId}/${f.name}`);
            const { error } = await supabase.storage
                .from('avatars')
                .remove(filesToDelete);

            if (error) {
                return { success: false, error: error.message };
            }
        }

        // update profile
        await updateUserProfile(userId, { avatar_url: null });

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting avatar:', error);
        return { success: false, error: error.message || 'Failed to delete avatar' };
    }
}
