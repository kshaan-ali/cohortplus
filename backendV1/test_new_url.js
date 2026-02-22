import https from 'https';

function testUrl() {
    const url = 'https://rsaidiaymwnvzakzlaoq.supabase.co/storage/v1/object/public/course-thumbnails/thumbnails/0.6791317891295372.jpg';
    console.log(`Testing URL: ${url}`);

    https.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Status Text: ${res.statusMessage}`);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log('✅ URL is publicly accessible!');
            } else {
                console.log('❌ URL is NOT publicly accessible.');
                console.log(`Response Body: ${data}`);
            }
        });
    }).on('error', (err) => {
        console.error('❌ Error fetching URL:', err.message);
    });
}

testUrl();
