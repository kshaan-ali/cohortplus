import { supabase } from '../config/supabase.js';

/**
 * Upload a course material
 */
export const uploadMaterial = async (req, res) => {
    try {
        const { courseId, title } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!courseId || !title) {
            return res.status(400).json({ message: 'courseId and title are required' });
        }

        // 1. Upload to Supabase Storage
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `materials/${courseId}/${fileName}`;

        console.log(`Uploading file to Supabase: ${storagePath}`);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('materials')
            .upload(storagePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError);
            return res.status(500).json({ message: 'Error uploading to storage', error: uploadError.message });
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('materials')
            .getPublicUrl(storagePath);

        // 3. Save metadata to Database
        const { data: dbData, error: dbError } = await supabase
            .from('course_materials')
            .insert([{
                course_id: courseId,
                title: title,
                file_url: publicUrl,
                file_type: fileExt,
                file_size: file.size
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Supabase DB Error:', dbError);
            // Cleanup: delete from storage if DB insert fails
            await supabase.storage.from('materials').remove([storagePath]);
            return res.status(500).json({ message: 'Error saving metadata to database', error: dbError.message });
        }

        return res.status(201).json({
            message: 'Material uploaded successfully',
            material: dbData
        });

    } catch (error) {
        console.error('Unexpected error in uploadMaterial:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get materials for a course
 */
export const getMaterialsByCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const { data, error } = await supabase
            .from('course_materials')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ message: 'Error fetching materials', error: error.message });
        }

        return res.status(200).json({ materials: data });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Delete a material
 */
export const deleteMaterial = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Get material info to find storage path
        const { data: material, error: fetchError } = await supabase
            .from('course_materials')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Extract storage path from public URL
        // Example: .../storage/v1/object/public/materials/materials/courseId/fileName
        // We need: materials/courseId/fileName
        const urlParts = material.file_url.split('/materials/');
        const storagePath = urlParts[urlParts.length - 1];

        console.log(`Deleting file from Supabase: ${storagePath}`);

        // 2. Delete from Storage
        const { error: storageError } = await supabase.storage
            .from('materials')
            .remove([storagePath]);

        if (storageError) {
            console.warn('Error deleting from storage (continuing with DB deletion):', storageError);
        }

        // 3. Delete from Database
        const { error: dbError } = await supabase
            .from('course_materials')
            .delete()
            .eq('id', id);

        if (dbError) {
            return res.status(500).json({ message: 'Error deleting metadata from database', error: dbError.message });
        }

        return res.status(200).json({ message: 'Material deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
