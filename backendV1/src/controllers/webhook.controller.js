import { supabase } from '../config/supabase.js';
import * as zoomService from '../services/zoom.js';
import axios from 'axios';
import crypto from 'crypto';

export const handleZoomWebhook = async (req, res) => {
    const { event, payload } = req.body;
    console.log(`[Zoom Webhook] Received event: ${event}`);

    // 1. Handle URL Validation (CRC Handshake)
    if (event === 'endpoint.url_validation') {
        const plainToken = payload.plainToken;
        const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

        if (!secretToken) {
            console.error('ZOOM_WEBHOOK_SECRET_TOKEN is not defined');
            return res.status(500).send('Configuration Error');
        }

        const hash = crypto
            .createHmac('sha256', secretToken)
            .update(plainToken)
            .digest('hex');

        return res.status(200).json({
            plainToken,
            encryptedToken: hash
        });
    }

    // 2. Verify Signature for other events
    if (!zoomService.verifyWebhookSignature(req)) {
        console.warn('Unauthorized Zoom Webhook attempt - Signature mismatch');
        return res.status(401).send('Unauthorized');
    }

    // 3. Handle Recording Completed
    if (event === 'recording.completed') {
        try {
            const { object } = payload;
            const zoomMeetingId = object.id.toString();
            const recordingFiles = object.recording_files;

            console.log(`Processing recording for Meeting ID: ${zoomMeetingId}`);

            // Find the local live_session
            const { data: session, error: sessionError } = await supabase
                .from('live_sessions')
                .select('id, batch_id')
                .eq('zoom_meeting_id', zoomMeetingId)
                .single();

            if (sessionError || !session) {
                console.warn(`No local session found for Zoom Meeting ID: ${zoomMeetingId}`);
                return res.status(200).send('Session not found, skipping');
            }

            // Process MP4 files
            for (const file of recordingFiles) {
                if (file.file_type === 'MP4') {
                    await processVideoFile(file, session);
                }
            }

            return res.status(200).send('Success');
        } catch (error) {
            console.error('Error handling recording.completed:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    // Default response for other events
    res.status(200).send('Event received');
};

/**
 * Download from Zoom and Stream to Supabase
 */
async function processVideoFile(file, session) {
    const { download_url, id: fileId, file_size, duration } = file;
    const storagePath = `recordings/${session.id}/${fileId}.mp4`;

    console.log(`Streaming file ${fileId} to Supabase...`);

    try {
        // Zoom download URL requires an OAuth token if it's protected
        const token = await zoomService.getZoomToken();

        const response = await axios({
            method: 'get',
            url: download_url,
            params: { access_token: token },
            responseType: 'stream'
        });

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recordings')
            .upload(storagePath, response.data, {
                contentType: 'video/mp4',
                duplex: 'half', // Required for streaming in Node v18+
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('recordings')
            .getPublicUrl(storagePath);

        // Insert into recordings table
        const { error: dbError } = await supabase
            .from('recordings')
            .insert([{
                batch_id: session.batch_id,
                live_session_id: session.id,
                recording_url: publicUrl,
                duration: duration,
                created_at: new Date().toISOString()
            }]);

        if (dbError) throw dbError;

        console.log(`Successfully saved recording part: ${publicUrl}`);
    } catch (error) {
        console.error(`Failed to process video file ${fileId}:`, error.message);
    }
}
