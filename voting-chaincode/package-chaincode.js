const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(__dirname, 'voting-chaincode.tar.gz'));
const archive = archiver('tar', {
    gzip: true,
    zlib: { level: 9 } // Compression level
});

// Listen for all archive data to be written
output.on('close', function () {
    console.log('Chaincode archived successfully!');
    console.log('Total bytes: ' + archive.pointer());
});

// Error handling
archive.on('error', function (err) {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files to the archive
archive.directory('lib/', 'lib');
archive.file('index.js', { name: 'index.js' });
archive.file('package.json', { name: 'package.json' });

// Finalize the archive
archive.finalize(); 