import https from 'https';

function testHeaders() {
    const url = 'https://rsaidiaymwnvzakzlaoq.supabase.co/storage/v1/object/public/course-thumbnails/thumbnails/0.08911156279764798.jpeg';
    console.log(`Testing Headers for URL: ${url}`);

    https.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log('--- Headers ---');
        console.log(JSON.stringify(res.headers, null, 2));

        res.on('data', () => { }); // Consume data
        res.on('end', () => {
            console.log('--- End ---');
            process.exit(0);
        });
    }).on('error', (err) => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

testHeaders();
