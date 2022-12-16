const fs = require("fs");
const os = require('os');
const endianness = os.endianness();
console.info(endianness);
const Path = require("path");
const { pipeline, Transform } = require("stream");

const LC3 = require("lc3codec");

const LC3FrameDuration = LC3.Core.LC3FrameDuration;
const LC3SampleRate = LC3.Core.LC3SampleRate;

//  Frame duration.
//let Nms = LC3FrameDuration.NMS_10000US;  //  10 ms.
// let Nms = LC3FrameDuration.NMS_07500US;  //  7.5 ms.

//  Sample rate.
// let Fs = LC3SampleRate.FS_08000;  //  8 kHz.
//let Fs = LC3SampleRate.FS_16000;  //  16 kHz.
// let Fs = LC3SampleRate.FS_24000;  //  24 kHz.
// let Fs = LC3SampleRate.FS_32000;  //  32 kHz.
// let Fs = LC3SampleRate.FS_44100;  //  44.1 kHz.
// let Fs = LC3SampleRate.FS_48000;  //  48 kHz.


//  Encoder configurations.
const CONFIG_FS = LC3SampleRate.FS_48000;
const CONFIG_NMS = LC3FrameDuration.NMS_10000US;
const LC3Encoder = LC3.Encoder.LC3Encoder;
let encoder = new LC3Encoder(CONFIG_NMS, CONFIG_FS);
let NF = encoder.getFrameSize();
console.log({ NF });

const CONFIG_BYTE_PER_FRAME = 240;

//  Input file.
const INPUT_PATH = Path.join(__dirname, "public", "ushushkani16mono48.pcm");
let readStream = fs.createReadStream(INPUT_PATH,{
    highWaterMark:NF*2
});

//  Output file.
const OUTPUT_PATH = Path.join(__dirname, "public", "ushushkani16mono48.lc3");
let writeStream = fs.createWriteStream(OUTPUT_PATH,{
    //autoClose:false
});

let outheader = Buffer.allocUnsafe(4);
outheader.writeUInt16BE(CONFIG_NMS.toMicroseconds(), 0);
outheader.writeUInt16BE(CONFIG_FS.getSampleRate(), 2);


let bytebuf = Buffer.allocUnsafe(242);
let i = 0;
const transformStream = new Transform({
    transform(chunk, encoding, callback) {
        i++;
        const frame = new Int16Array(
            chunk.buffer,
            chunk.byteOffset,
            //chunk.length/Int16Array.BYTES_PER_ELEMENT
        );
        
        const frame_size = frame.length;

        if(frame_size < NF){
            console.log("SHORT FRAME... ending");
            callback(null, Buffer.from([0x00,0x00]));
            return;
        }

        //console.log({frame_size,frame});
        try{
            
            //const out = encoder.encode(frame, chunk.length);
            bytebuf.writeUInt16BE(frame_size/2,0);
            //console.log({bytebuf})
            const out = encoder.encode(frame, CONFIG_BYTE_PER_FRAME, bytebuf.subarray(2));

            
            callback(null, bytebuf);
            //callback(null,null);
        }
        catch(err){
            callback(err,null); 
        }
    },
    final(callback){
        //this.write(Buffer.from([0x00,0x00]));
        callback()
    },
    writableHighWaterMark: CONFIG_BYTE_PER_FRAME,
    //autoClose: false,
    //encoding: 'ArrayBuffer',
  });
  //transformStream.on('data', (chunk) => console.log({len:chunk.length,chunk}));

//readStream.pipe(writeStream);
async function startStreaming() {
    writeStream.write(outheader);
    await pipeline(
        readStream,
        transformStream,
        writeStream,
        (err) => {
            if (err) {
                console.error("An error occured in pipeline.", err);
            } else {
                console.log("Pipeline execcution successful");
            }
        }
    )
    //writeStream.write()
}


startStreaming();


/*
let bytebufs = new Array(nframes);
for (let i = 0; i < nframes; ++i) {
    let frame = frames[i];
    let nbytes = frames_nbytes[i];

    //  Allocate buffer.
    let bytebuf = new Uint8Array(nbytes);
    //  (...Buffer can also be used in Node environment...)
    // let bytebuf = Buffer.allocUnsafe(nbytes);

    //  Encode the frame.
    encoder.encode(frame, nbytes, bytebuf);

    bytebufs[i] = bytebuf;
}
*/