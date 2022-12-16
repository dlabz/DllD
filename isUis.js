const fs = require('fs');
const mm = require('music-metadata');
const { resolve } = require('path');
const util = require('util');
const portAudio = require('naudiodon');


const WAE = require('web-audio-engine');
const Speaker = require("speaker");
const AudioContext = WAE.StreamAudioContext;
const context = new AudioContext();
const speaker = new Speaker();
// Set the output for audio streaming
//context.pipe(process.stdout);


const play = require('audio-play');
const load = require('audio-loader');



console.debug({context,speaker});


const mp3 = [
    './assets/music/isUis00001.mp3',
    './assets/music/isUis00002.mp3',
    './assets/music/isUis00003.mp3',
    './assets/music/isUis00004.mp3',
    './assets/music/isUis00005.mp3',
    './assets/music/isUis00006.mp3',

]
.map(async (file) => {
    try {
        const metadata = await mm.parseFile(file)
        const data = await load(file);
        console.log({file,metadata, data})

        
        return {file,metadata, data};
    }
    catch (error) {
        console.error(error.message);
    }

})


const how = context.Options;
const files = Promise.all(mp3).then((arr)=>
            arr
            .map( ({file,how, metadata, data}) =>[ file, data, util.inspect(metadata, { showHidden: false, depth: null })])
            
).then(files=>{
    
    files.forEach(([,data])=>{
        play(data,play.Options)
    })
    
    
})



/*
const { Orchestre } = require('orchestre-js');

const orchestra = new Orchestre(120, audioContext);


const players = [
    {
      name: 'chords',
      url: './assets/music/isUis00001.mp3',
      length: 16,
      absolute: true,
    },
    {
      name: 'bass',
      url: './assets/music/isUis00002.mp3',
      length: 16,
      absolute: true,
    },
    {
      name: 'guitar',
      url: './assets/music/isUis00003.mp3',
      length: 8,
    },
  ];

  orchestra.addPlayers(players).then((data)=>{
     console.log( {data} );
  });

*/

const { defaultHostAPI, HostAPIs } = portAudio.getHostAPIs();
const { defaultInput, defaultOutput, name } = HostAPIs[defaultHostAPI];


console.log({ defaultHostAPI, HostAPIs })

const  devices  = portAudio.getDevices();
const oiio = {
    name,
    defaultInput: devices[defaultInput], 
    defaultOutput: devices[defaultOutput]
}
console.log({oiio});


//debugger;

/*
var ao = new portAudio.AudioIO({
    outOptions: {
        channelCount: 2,
        sampleFormat: portAudio.SampleFormat16Bit,
        sampleRate: 48000,
        deviceId: -1, // Use -1 or omit the deviceId to select the default device
        closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
    }
});


rs.pipe(ao);
ao.start(); 



debugger;

*/






// Promise.all(mp3).then(console.log,console.error)

//const io = fs.createReadStream(mp3[0])





//const play = require('audio-play');
//const load = require('audio-loader');
//load('./assets/music/Louis Jordan - Is You Is Or Is You Ain t My Baby (Custom accompaniment ) (2).mp3').then(play);

if (false) {


    
    console.log(portAudio.getDevices());
    console.log(portAudio.getHostAPIs());

    // Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
    var ao = new portAudio.AudioIO({
        outOptions: {
            channelCount: 2,
            sampleFormat: portAudio.SampleFormat16Bit,
            sampleRate: 48000,
            deviceId: -1, // Use -1 or omit the deviceId to select the default device
            closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
        }
    });

    // Create a stream to pipe into the AudioOutput
    // Note that this does not strip the WAV header so a click will be heard at the beginning
    var rs = fs.createReadStream('steam_48000.wav');

    // Start piping data and start streaming
    rs.pipe(ao);
    ao.start();
}