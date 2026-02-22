import fetch from 'node-fetch';

async function testUrl() {
    const url = 'https://rsaidiaymwnvzakzlaoq.supabase.co/storage/v1/object/public/course-thumbnails/thumbnails/0.08911156279764798.jpeg';
    console.log(`Testing URL: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        console.log(`Status Text: ${response.statusText}`);

        if (response.ok) {
            console.log('✅ URL is publicly accessible!');
        } else {
            console.log('❌ URL is NOT publicly accessible.');
            const body = await response.text();
            console.log(`Response Body: ${body}`);
        }
    } catch (error) {
        console.error('❌ Error fetching URL:', error.message);
    }
}

testUrl();
