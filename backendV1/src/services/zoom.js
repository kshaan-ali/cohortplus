import axios from 'axios';
import jsrsasign from 'jsrsasign';
import crypto from 'crypto';

const ZOOM_API_BASE = 'https://api.zoom.us/v2';

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get Server-to-Server OAuth Token
 */
export const getZoomToken = async () => {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    const { ZOOM_CLIENT_ID, ZOOM_SECRET, ZOOM_ACCOUNT_ID } = process.env;

    if (!ZOOM_CLIENT_ID || !ZOOM_SECRET || !ZOOM_ACCOUNT_ID) {
        throw new Error('Missing required Zoom environment variables: ZOOM_CLIENT_ID, ZOOM_SECRET, or ZOOM_ACCOUNT_ID');
    }

    try {
        const auth = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_SECRET}`).toString('base64');

        // Server-to-Server OAuth uses account_id query param
        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
            null,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        const { access_token, expires_in } = response.data;
        console.log('Zoom OAuth Token received successfully.');

        cachedToken = access_token;
        // Buffer for 60 seconds
        tokenExpiresAt = Date.now() + (expires_in * 1000) - 60000;

        return access_token;
    } catch (error) {
        console.error('Error getting Zoom token:', error.message);
        if (error.response) {
            console.error('Zoom Error Response Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Zoom Error Response Status:', error.response.status);
            console.error('Zoom Error Response Headers:', JSON.stringify(error.response.headers, null, 2));
        }
        throw new Error('Failed to authenticate with Zoom: ' + (error.response?.data?.reason || error.message));
    }
};

/**
 * Create a Zoom Meeting
 */
export const createMeeting = async (topic, startTime, duration = 60) => {
    try {
        const token = await getZoomToken();

        const response = await axios.post(
            `${ZOOM_API_BASE}/users/me/meetings`,
            {
                topic,
                type: 2, // Scheduled meeting
                start_time: startTime,
                duration,
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: true,
                    mute_upon_entry: true,
                    waiting_room: false,
                    auto_recording: 'cloud',
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Zoom meeting created:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('Error creating Zoom meeting:', error.message);
        if (error.response) {
            console.error('Zoom Meeting Create Error Data:', JSON.stringify(error.response.data, null, 2));
        }
        throw new Error('Failed to create Zoom meeting: ' + (error.response?.data?.message || error.message));
    }
};

/**
 * Generate Signature for Web SDK (Meeting SDK)
 * Using KJUR as required by Zoom
 */
export const generateSignature = (meetingNumber, role) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // 2 hours expiration
    const oHeader = { alg: 'HS256', typ: 'JWT' };

    // Use ZOOM_SDK_KEY and ZOOM_SDK_SECRET for Web SDK signatures
    // Fallback to CLIENT_ID/SECRET if SDK_KEY is not defined (legacy behavior)
    const sdkKey = process.env.ZOOM_SDK_KEY || process.env.ZOOM_CLIENT_ID;
    const sdkSecret = process.env.ZOOM_SDK_SECRET || process.env.ZOOM_SECRET;

    const oPayload = {
        sdkKey: sdkKey,
        mn: meetingNumber,
        role: role, // 0 = attendee, 1 = host
        iat: iat,
        exp: exp,
        appKey: sdkKey,
        tokenExp: exp
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = jsrsasign.KJUR.jws.JWS.sign(
        'HS256',
        sHeader,
        sPayload,
        sdkSecret
    );

    return signature;
};

/**
 * Verify Zoom Webhook Signature (modern approach)
 */
export const verifyWebhookSignature = (req) => {
    const signature = req.headers['x-zm-signature'];
    const timestamp = req.headers['x-zm-request-timestamp'];
    const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

    if (!signature || !timestamp || !secretToken) {
        return false;
    }

    // Zoom requires a specific format: "v0:<timestamp>:<req_body_string>"
    // We assume the body is already parsed or raw. Express usually provides parsed body.
    const message = `v0:${timestamp}:${JSON.stringify(req.body)}`;

    const hash = crypto
        .createHmac('sha256', secretToken)
        .update(message)
        .digest('hex');

    const expectedSignature = `v0=${hash}`;
    return signature === expectedSignature;
};
