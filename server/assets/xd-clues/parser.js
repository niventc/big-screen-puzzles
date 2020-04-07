const fs = require('fs');
const readline = require('readline');
const zlib = require('zlib');

const inputStream = fs.createReadStream("./xd/clues.tsv");
const outputStream = fs.createWriteStream("./grouped.psv");

const reader = readline.createInterface({
    input: inputStream,
    terminal: false
});

const clueMap = new Map();

reader.on('line', (line) => {
    const parts = line.split('\t');

    let clues = clueMap.get(parts[2]);
    if (!clues) {
        clues = new Set();
        clueMap.set(parts[2], clues);
    }
    clues.add(parts[3]);
});

reader.on('close', () => {
    clueMap.forEach((v, k) => {
        outputStream.write(k + ": " + Array.from(v.values()).join("|") + "\n");
    });

    outputStream.end();

    const gzip = zlib.createGzip({ level: zlib.constants.Z_BEST_COMPRESSION });
    const groupedInputStream = fs.createReadStream("./grouped.psv");
    const zipStream = fs.createWriteStream("./grouped.psv.gz");
    groupedInputStream.pipe(gzip).pipe(zipStream);
});
