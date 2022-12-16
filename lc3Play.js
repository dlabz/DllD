//  Imported modules.
const LC3 = require("lc3codec");
const {promisify} = require("util");
const FS = require("fs");
const Path = require("path");
const readAsync = promisify(FS.readFile);
const { pipeline, Transform } = require("stream");
const fs = require("lc3codec/lc3/common/fs");

var Speaker = require('speaker');

 
//  Imported classes.
const LC3FrameDuration = 
    LC3.Core.LC3FrameDuration;
const LC3SampleRate = 
    LC3.Core.LC3SampleRate;
const LC3BEC = 
    LC3.Decoder.LC3BEC;
const LC3Decoder = 
    LC3.Decoder.LC3Decoder;

//
//  Constants.
//

//  Input file.
//const INPUT_PATH = Path.join(__dirname,"public", "input.lc3");
const INPUT_PATH = Path.join(__dirname,"public", "ushushkani16mono48.lc3");
const OUTPUT_PATH = Path.join(__dirname, "public", "ushushkani16mono48.lc3.raw");

const channels = 1;
const bitDepth = 16;
let sampleRate;

async function readHeader(path){
    const fd = FS.openSync(path, FS.constants.O_RDONLY);
    const header = new Uint16Array(2);
    FS.readSync(fd, header, 0, 4);
    FS.closeSync(fd);
    Buffer.from(header.buffer).swap16(); // BE2LE
    console.log({header});
    const [_nms, _fs] = header;
    sampleRate = _fs;

    const Fs = LC3SampleRate[`FS_${_fs.toString().padStart(5,'0')}`];
    const Nms = LC3FrameDuration[`NMS_${_nms.toString().padStart(5,'0')}US`];
    return new LC3Decoder(Nms, Fs);
}



let i = 0;

async function startStreaming(){
    const dc = await readHeader(INPUT_PATH);

    const speaker = new Speaker({ channels, sampleRate, bitDepth })

    const frame_size = dc.getFrameSize();
    console.log({frame_size});
    const frame = new Array(frame_size);
    const pcmbuf = new Int16Array(frame_size );
    let bfi = new LC3BEC();
    const transformStream = new Transform({
        transform(chunk, encoding, callback) {
            i++;
            const nbytes = Buffer.from(chunk.buffer,0,2).readUInt16BE(0);
            //console.log({nbytes});

            if(nbytes == 0){
                callback(null,null);
            }else{
                
                dc.decode(chunk.slice(2, 2 + nbytes),bfi, pcmbuf);
        
                if (bfi.isMarked()) {
                    console.log({i,nbytes,chunk})
                    throw new Error("File corrupted (decode error). "+i);
                }

            //console.log({
                //nbytes, 
                //chunk,
                //bfi, 
             //   pcmbuf})
            callback(null, Buffer.from(pcmbuf.buffer));
            }
        },
        //highWaterMark:82,

    })
    //transformStream.on('data', (chunk) => console.log({len:chunk.length,chunk}));
    const readStream = FS.createReadStream(INPUT_PATH,{start:4, highWaterMark:242});
    
    const writeStream = FS.createWriteStream(OUTPUT_PATH);

    await pipeline(
        readStream,
        transformStream,
        //speaker,
        writeStream,
        (err) => {
            if (err) {
                console.error("An error occured in pipeline.", err);
            } else {
                console.log("Pipeline execcution successful");
            }
        }
    )
}

startStreaming();

//readAsync(ifd,header,0,4);

//  Output file.
//const OUTPUT_PATH = Path.join(__dirname,"public", "output.raw");

//let Fs, Nms, dc, bfi, frame, pcmbuf, bytebuf;
/*


let readStream = FS.createReadStream(INPUT_PATH,{
    //highWaterMark:NF*2
});



readStream.once("readable",()=>{
    const [_nms, _fs] = new Uint16Array(readStream.read(4).swap16().buffer,0,2);
    
    console.log({_nms, _fs})

    Fs = LC3SampleRate[`FS_${_fs.toString().padStart(5,'0')}`];
    Nms = LC3FrameDuration[`NMS_${_nms.toString().padStart(5,'0')}US`];

    console.log({Nms, Fs})
    dc = new LC3Decoder(Nms, Fs);
    const frame_size = dc.getFrameSize();
    console.log({frame_size});
    frame = Uint8Array(frame_size)
    pcmbuf = Buffer.allocUnsafe(frame_size * 2);

    

})
*/

