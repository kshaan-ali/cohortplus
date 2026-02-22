import https from 'https';
import fs from 'fs';

function download() {
    const url = 'https://rsaidiaymwnvzakzlaoq.supabase.co/storage/v1/object/public/course-thumbnails/thumbnails/0.08911156279764798.jpeg';
    const file = fs.createWriteStream('test_image.jpeg');

    https.get(url, (res) => {
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            const stats = fs.statSync('test_image.jpeg');
            console.log(`Download finished. File size: ${stats.size} bytes`);
            if (stats.size > 0) {
                console.log('✅ File is not empty.');
            } else {
                console.log('❌ File is EMPTY.');
            }
        });
    }).on('error', (err) => {
        console.error('❌ Error downloading:', err.message);
    });
}

download();
