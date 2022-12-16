var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');
 
var file = fs.createReadStream('public/ushushkani16mono48.wav');
var out = fs.createWriteStream('public/ushushkani16mono48.pcm');
var reader = new wav.Reader({

});


 
// the "format" event gets emitted at the end of the WAVE header
reader.on('format', function (format) {
 
    console.log({format})
  // the WAVE header is stripped from the output of the reader
  //reader.pipe(new Speaker(format));
  reader.pipe(out);
});
 
reader.on('error', function (err) {
  console.error('Reader error: %s', err);
});

// pipe the WAVE file to the Reader instance
file.pipe(reader);


/*
const Speaker = require('speaker');

// Create the Speaker instance
const speaker = new Speaker({
  channels: 2,          // 2 channels
  bitDepth: 16,         // 16-bit samples
  sampleRate: 44100     // 44,100 Hz sample rate
});

// PCM data from stdin gets piped into the speaker
process.stdin.pipe(speaker);

*/