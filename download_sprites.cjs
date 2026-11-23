const fs = require('fs');
const path = require('path');
const https = require('https');

const dbPath = path.join(__dirname, 'public/src/db.js');
let dbContent = fs.readFileSync(dbPath, 'utf8');

// Find all URLs
const urlRegex = /https:\/\/img\.pokemondb\.net\/sprites\/black-white\/anim\/([a-zA-Z0-9\-\/]+)\.gif/g;
const matches = [];
let match;
while ((match = urlRegex.exec(dbContent)) !== null) {
    matches.push({
        fullUrl: match[0],
        subPath: match[1] // e.g. "normal/bulbasaur" or "back-shiny/bulbasaur"
    });
}

// Deduplicate matches by fullUrl
const uniqueMatches = Array.from(new Set(matches.map(m => m.fullUrl))).map(url => {
    return matches.find(m => m.fullUrl === url);
});

console.log(`Found ${matches.length} matches, ${uniqueMatches.length} unique URLs to download.`);

const baseDir = path.join(__dirname, 'public/assets/sprites');

// Ensure base directories exist
const subDirs = ['normal', 'back-normal', 'shiny', 'back-shiny'];
subDirs.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Download helper with retries and timeout
function downloadFile(url, dest, retries = 3) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
            // Already downloaded
            return resolve(true);
        }

        const file = fs.createWriteStream(dest);
        const request = https.get(url, { timeout: 10000 }, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => {}); // delete incomplete file
                if (retries > 0) {
                    // Retry
                    setTimeout(() => {
                        downloadFile(url, dest, retries - 1).then(resolve).catch(reject);
                    }, 500);
                } else {
                    reject(new Error(`Server responded with status code ${response.statusCode}`));
                }
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(true));
            });
        }).on('error', (err) => {
            file.close();
            fs.unlink(dest, () => {});
            if (retries > 0) {
                setTimeout(() => {
                    downloadFile(url, dest, retries - 1).then(resolve).catch(reject);
                }, 500);
            } else {
                reject(err);
            }
        }).on('timeout', () => {
            request.destroy();
            file.close();
            fs.unlink(dest, () => {});
            if (retries > 0) {
                setTimeout(() => {
                    downloadFile(url, dest, retries - 1).then(resolve).catch(reject);
                }, 500);
            } else {
                reject(new Error('Request timed out'));
            }
        });
    });
}

// Queue system for downloading with limited concurrency
async function downloadAll(items, concurrency = 25) {
    let index = 0;
    let completed = 0;
    let failed = 0;

    const workers = Array(concurrency).fill(null).map(async () => {
        while (index < items.length) {
            const currentIdx = index++;
            const item = items[currentIdx];
            const destPath = path.join(baseDir, `${item.subPath}.gif`);

            // Ensure parent directory exists for this specific subPath
            const dir = path.dirname(destPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            try {
                await downloadFile(item.fullUrl, destPath);
                completed++;
                if (completed % 100 === 0 || completed === items.length) {
                    console.log(`Downloaded ${completed}/${items.length} sprites...`);
                }
            } catch (err) {
                failed++;
                console.error(`Failed to download ${item.fullUrl}: ${err.message}`);
            }
        }
    });

    await Promise.all(workers);
    console.log(`Finished downloads. Success: ${completed}, Failed: ${failed}.`);
}

async function main() {
    console.log('Starting download process...');
    await downloadAll(uniqueMatches, 30);

    console.log('Replacing URLs in db.js with local paths...');
    // Replace: https://img.pokemondb.net/sprites/black-white/anim/
    // with: assets/sprites/
    const updatedContent = dbContent.replace(/https:\/\/img\.pokemondb\.net\/sprites\/black-white\/anim\//g, 'assets/sprites/');
    fs.writeFileSync(dbPath, updatedContent, 'utf8');
    console.log('db.js updated successfully!');
}

main().catch(err => {
    console.error('Error running download script:', err);
});
