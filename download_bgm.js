const fs = require('fs');
const https = require('https');
const http = require('http');

const targetPath = "d:/PROJECTS/Institue website/pinnacle-frontend/audio/academy_bgm_track.mp3";
const file = fs.createWriteStream(targetPath);

function download(srcUrl) {
    const client = srcUrl.startsWith('https') ? https : http;
    client.get(srcUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, function(response) {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            download(response.headers.location);
            return;
        }
        response.pipe(file);
        file.on('finish', function() {
            file.close();
            console.log("Audio download finished successfully! File size:", fs.statSync(targetPath).size);
        });
    }).on('error', function(err) {
        console.error("Download error:", err);
    });
}

download("https://assets.mixkit.co/music/preview/mixkit-raising-me-higher-34.mp3");
